# Caching, Rate Limiting & Pagination Audit

## 1. Rate Limiting — ❌ Not used

No rate limiting anywhere:
- No library imported in the app
- No middleware checks
- No API route guards
- Only mention is `setTimeout(500)` in `scripts/backfill-embeddings.ts` to avoid OpenAI's rate limits

## 2. Caching — ❌ Minimal

- **`api/categories` only** — has `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`
- **`next.config.mjs`** — `minimumCacheTTL: 3600` for images only
- **`React.cache()`** — used once for the Supabase server client (standard RSC deduplication)
- **No product caching** — every products API call hits Supabase fresh
- **No `unstable_cache()`, `revalidatePath()`, `revalidateTag()`**, no Redis, no in-memory cache

## 3. Semantic Search — ❌ Fully recomputed every time

Every search calls:
1. **Gemini Embedding API** — external HTTP to `gemini-embedding-001`
2. **Supabase RPC (`match_products`)** — full sequential scan (no vector index exists; 3072D exceeds pgvector's 2000D index limit)

No caching at any layer: no in-memory, no Redis, no `Cache-Control`, no deduplication of repeated queries.

## 4. Pagination — ⚠️ Partial

| Route / Page | Server-side pagination | Client UI |
|---|---|---|
| `api/products` + product listing page | ✅ `page`, `limit`, `.range()` | ✅ `<Pagination>` component |
| `api/orders` + orders page | ✅ supports it | ❌ not wired up — loads all orders |
| Admin products page | ❌ no params passed | ❌ no controls |
| Admin orders page | ❌ no params passed | ❌ no controls |
| Search results | ❌ hardcoded to 8 | ❌ no pagination |
| Reviews, wishlist, cart, recently viewed | ❌ | ❌ |

---

## 5. Critical Issues & Architectural Bottlenecks

1. **No rate limiting on any endpoint** — All 21 API routes are fully exposed to abuse. Expensive routes like search (calls Gemini API + Supabase RPC), checkout (Stripe), and auth are unprotected.
2. **No caching layer for products** — Every product listing, detail, and search query hits the database fresh. Categories are the sole exception.
3. **Semantic search recomputes everything** — Every search fires an external Gemini Embedding API call + a full pgvector sequential scan (no vector index exists). Identical queries repeated seconds apart pay the same cost.
4. **No vector index** — pgvector's IVFFlat/HNSW cap at 2000 dimensions; Gemini outputs 3072D vectors. Every search is a full table scan.
5. **Missing pagination on orders, admin, search** — The orders page, admin products page, and admin orders page load all records at once. Search is capped at 8 results with no pagination.
6. **Sequential request waterfalls possible** — Some pages may have synchronous data fetching that could be parallelized.
7. **No Cache-Control headers on 20/21 API routes** — Browsers/CDNs cannot cache responses.

## 6. High-Impact Improvements

| # | Improvement | Impact | Effort |
|---|-------------|--------|--------|
| 1 | Add `Cache-Control` headers to product API routes | Low | High |
| 2 | Wire pagination into orders page (API already supports it) | High | Low |
| 3 | Add vector index workaround (dimensionality reduction or partitioned scan) | High | Medium |
| 4 | Product caching via `unstable_cache` + tag-based revalidation | High | Medium |
| 5 | Search result caching (in-memory LRU or Redis) | High | Low |
| 6 | Rate limiting on auth + search + checkout | Medium | Medium |

## 7. Phase 1: Rate Limiting Blueprint

**Architecture:**
- Use Upstash Redis (`@upstash/ratelimit` + `@upstash/redis`) — serverless-native, works globally via HTTP REST API, no connection pooling.
- Two limiters:
  - **IP-based**: for unauthenticated endpoints (search, product listing, categories) — 30 req/min sliding window.
  - **User-ID-based**: for authenticated endpoints (checkout, orders, cart mutations, admin) — 100 req/min sliding window.
- Implement as a reusable `rateLimit` utility that accepts request + context and returns either `{ success: true }` or throws `429` with `Retry-After`.

**Utility design (`src/lib/rate-limit.ts`):**
```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ipLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "60 s"),
  analytics: true,
  prefix: "@upstash/ratelimit:ip",
});

export const userLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "60 s"),
  analytics: true,
  prefix: "@upstash/ratelimit:user",
});
```

**Integration points:**
- `middleware.ts` — Apply IP-based limiting early for all API routes (`/api/:path*`) before auth checks.
- Each expensive API route (search, checkout, cart, admin) — Apply user-ID-based limiting after auth verification.

**Env vars:**
```
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

**Packages:**
```
npm install @upstash/ratelimit @upstash/redis
```

## 8. Phase 2: Search Cache Blueprint

**Cache architecture:**
- Use the same Upstash Redis instance from Phase 1 (no extra infra).
- Cache key: `search:query:{normalized_query_hash}` where normalization = `trim(lowercase(query)).replace(/\s+/, ' ')`.
- TTL: **300 seconds (5 minutes)** — short enough that stale results don't linger if products change, long enough to handle repeated typing/debounce spikes.
- Value: Full JSON response `{ products: [...] }` + timestamp.

**Flow:**
```
Search → normalize query → compute hash → GET redis →
  [HIT] → log hit, return cached products
  [MISS] → Gemini embedding → Supabase vector search → SET redis with TTL 300s → log miss → return products
```

**Implementation notes:**
- Wrap the search route handler with a `getCachedSearch` / `setCachedSearch` pair.
- Log cache hit/miss ratio to console (or a secure logger) for observability.
- On product update/deletion: optionally bust all search cache (or rely on TTL for simplicity — 5 min staleness is acceptable for product catalog).

## 9. Phase 3: Product Caching & Invalidation Blueprint

**Strategy: Use `unstable_cache` + `revalidateTag`**

**Cache layout:**

| Data | Cache Tag | TTL | Notes |
|------|-----------|-----|-------|
| `api/products` (listing) | `products-list` | 60s SWR | Tag invalidated on product create/update/delete |
| `api/products/[id]` (detail) | `product-{id}` | 300s SWR | Revalidated on product update |
| `api/categories` | `categories` | 3600s SWR | Already has Cache-Control; add tag too |
| `api/products/[id]/similar` | `product-similar-{id}` | 3600s | Dependent on product embeddings, rare changes |
| Featured/popular products | `products-featured` | 300s | Revalidated on admin override |

**Implementation approach:**
- In each **GET** API route handler, wrap the data fetch in `unstable_cache()` with the appropriate tags.
- In each **POST/PUT/DELETE** mutation, call `revalidateTag(...)` with the affected tags.
- This keeps the API route architecture unchanged — just add the caching layer around the database query.

**Example pattern (product detail):**
```ts
const getProduct = unstable_cache(
  async (id: string) => {
    const { data } = await supabase.from("products").select("*").eq("id", id).single();
    return data;
  },
  ["product", id],
  { tags: [`product-${id}`, "products-list"], revalidate: 300 }
);
```

**Revalidation triggers:**
- Product created → `revalidateTag("products-list")`, `revalidateTag("categories")`
- Product updated → `revalidateTag(`product-${id}`)`, `revalidateTag("products-list")`
- Product deleted → `revalidateTag("products-list")`, `revalidateTag("categories")`

## 10. Phase 4: Pagination & UX Strategy

**Current state gaps to fix:**

| Page | API supports pagination? | Page uses it? | Action |
|------|------------------------|---------------|--------|
| `/orders` | ✅ | ❌ | Wire `page` searchParam to the API call; add `<Pagination>` |
| `/admin/products` | ✅ (reuses products API) | ❌ | Add `page`/`limit` params; add `<Pagination>` |
| `/admin/orders` | ✅ | ❌ | Add `page`/`limit` params; add `<Pagination>` |
| Search results | ❌ (hardcoded 8) | ❌ | Add `page`/`limit` to search API; add `<Pagination>` |

**URL state pattern (already used by products page):**
```
/products?page=2&limit=20&sortBy=price&sortOrder=asc
```
This pattern must be replicated across all missing pages. The existing `<Pagination>` component already handles this — just needs to be imported and wired.

**Loading states:**
- Add `<Skeleton>` variants for product tables (admin) and order cards (orders page).
- Reuse the existing skeleton shimmer from `loading.tsx` or extract a `TableSkeleton` component.

## 11. Phase 5: Codebase Audit Checklist

Files needed to complete the performance audit:

1. **`src/app/products/page.tsx`** — Check for sequential vs parallel data fetches, unnecessary `"use client"` directives.
2. **`src/app/admin/page.tsx`** + **`api/admin/stats/route.ts`** — Confirm the full-table scan issue flagged in optimization.md.
3. **`src/app/page.tsx`** — Already partially audited; verify no sequential waterfalls remain after lazy-loading changes.
4. **`src/app/products/[id]/page.tsx`** — Check product detail page for parallel fetches (product + reviews + similar).
5. **`src/lib/supabase/server.ts`** — Already uses `React.cache()`; verify it's the only client factory.
6. **`src/components/products/ProductList.tsx`** — Check for `"use client"` necessity; could the search/pagination state be pushed to a smaller client island?
7. **`supabase/migrations/`** — List all migration files to check for existing indexes and identify missing ones.
8. **`package.json`** — Verify all dependencies; check for unused large packages.

**Suspected issues (without reading files):**
- **`"use client"` sprawl** — Many components may be client components when they could be server components with smaller client islands.
- **Admin stats page** — Loads entire tables into memory; needs aggregation queries instead.
- **No database indexes** on foreign keys (`category_id`, `user_id`), `is_active`, `created_at` for ordering.
- **No partial index** on `embedding IS NOT NULL` for the search RPC.

## 12. Recommended Implementation Timeline

| Step | Phase | Description | Depends On | Status |
|------|-------|-------------|------------|
| 1 | Phase 4 | Wire pagination into orders, admin, search — quick wins, no new infra | Nothing | ✅ Done |
| 2 | Phase 1 | Install Upstash packages, create utility, integrate into middleware + key routes | Nothing | ✅ Done |
| 3 | Phase 3 | Add `unstable_cache` to product GET routes, add `revalidateTag` to mutations | Phase 1 (shares Redis if using Upstash for cache too) |
| 4 | Phase 2 | Add search result caching using Upstash Redis | Phase 1 Redis instance |
| 5 | Phase 5 | Audit `"use client"`, parallel fetches, missing indexes, bundle size | Steps 1-4 |
| 6 | Phase 5 | Fix identified issues — database indexes, component refactoring, query optimization | Step 5 |

Order notes:
- Pagination (Step 1) has zero dependencies and yields immediate UX benefit.
- Rate limiting (Step 2) is independent but introduces the Redis dependency that search caching (Step 4) also needs.
- Product caching (Step 3) could use Next.js `unstable_cache` without Redis (it uses Next.js's built-in cache layer), so it doesn't strictly depend on Step 2. But if you want a shared Redis backend for persistent caching across deployments, combine with Step 2.
