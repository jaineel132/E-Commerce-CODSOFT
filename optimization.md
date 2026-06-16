# Performance Optimization Plan — Verdant E-Commerce

---

## Critical

### 1. ✅ Admin Stats Route Loads Entire Tables into JavaScript Memory

- **File:** `src/app/api/admin/stats/route.ts` (entire file, lines 23–84)
- **Root cause:** Three unbounded table scans (`SELECT * FROM orders` with no WHERE, `SELECT * FROM order_items` with no WHERE, `SELECT * FROM products`) all streamed into Node.js, then aggregated using JS Maps and manual loops instead of SQL aggregates.
- **Impact:** At 10,000 orders / 50,000 order_items: 50+ MB transferred, blocking the event loop for seconds, likely timing out.
- **Fix:** Replace with 3 aggregate SQL queries using `COUNT`, `SUM`, `GROUP BY`, `date_trunc`, and `supabase.rpc()` for top products.

### 2. ✅ No IVFFlat Index on pgvector Embeddings

- **File:** `supabase/migrations/003_pgvector_setup.sql`
- **Root cause:** The `match_products` function performs `ORDER BY embedding <=> query_embedding` with no index. Every semantic search does a full sequential scan of all product embeddings (3072-dimensional vectors).
- **Impact:** Below ~1,000 products it may be tolerable. Above 5,000, vector search latency goes from ~5ms to 500ms+.
- **Fix:** Add `CREATE INDEX products_embedding_idx ON products USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);`

### 3. ✅ Missing Pagination on Orders API

- **File:** `src/app/api/orders/route.ts` (line 12–16)
- **Root cause:** `supabase.from('orders').select('*, order_items(*, product:products(name, image_url)), shipping_address:addresses(*)').eq('user_id', user.id)` — no `.range()`, no `.limit()`.
- **Impact:** A user with 200+ orders receives all of them in a single response. Payload can exceed 1 MB.
- **Fix:** Add `.range(from, to)` with `page` and `limit` from search params.

### 4. ✅ Duplicate Product Query in Metadata + Page

- **File:** `src/app/products/[id]/page.tsx` (lines 31 and 44)
- **Root cause:** `generateMetadata()` calls `await getProduct(id)`, then the page component calls `await getProduct(id)` again.
- **Impact:** 2× database latency on every product page (200ms → 400ms).
- **Fix:** Either cache the result (`React.cache()`) or refetch only needed fields in `generateMetadata`.

### 5. ✅ Admin Stats Route Double Auth Check

- **File:** `src/app/api/admin/stats/route.ts` (lines 6–20)
- **Root cause:** Unconditionally calls `supabase.auth.getUser()` + `supabase.from('profiles').select('role')` before any stats work.
- **Impact:** Every admin API call incurs 2 extra sequential DB round-trips.
- **Fix:** Pass user info via middleware-set headers, or consolidate into a single middleware check.

---

## High

### 6. ✅ Double Category Lookup (N+1)

- **Files:** `src/app/api/products/route.ts` (lines 40–46), `src/app/products/page.tsx` (lines 33–38)
- **Root cause:** The same category ID query runs twice — once for count, once for data.
- **Fix:** Extract to a single `const catId = ...` before the conditional.

### 7. ✅ Sequential Independent Queries in Reviews Route

- **File:** `src/app/api/products/[id]/reviews/route.ts` (lines 11–25)
- **Root cause:** Two sequential Supabase queries that are independent.
- **Fix:** Use `Promise.all()`.

### 8. ✅ N+1 Stock Decrement in Stripe Webhook

- **File:** `src/app/api/webhooks/stripe/route.ts` (lines 109–118)
- **Root cause:** Serial loop calling one RPC per product.
- **Fix:** Create a batch `decrement_stock_batch` RPC accepting an array.

### 9. ✅ ClearCart Makes N Sequential API Calls

- **File:** `src/hooks/useCart.ts` (lines 97–110)
- **Root cause:** `for (const item of cartItems) { await fetch('/api/cart', ...) }` — repeats N DELETE requests serially.
- **Fix:** Add a `DELETE /api/cart?all=true` endpoint.

### 10. ✅ Missing Foreign Key Indexes

| Missing Index | Reason |
|---|---|
| `products.category_id` | Used in all product listings with category filter |
| `orders.user_id` | Used in order history queries |
| `orders.status` | Used in admin order filtering |
| `order_items.order_id` | Used in order detail queries |
| `order_items.product_id` | Used in stats and verified purchases |
| `reviews.product_id` | Used in review pages |
| `profiles.role` | Used in RLS + admin checks |

- **Fix:** Add `CREATE INDEX IF NOT EXISTS` migrations.

### 11. ✅ Unbounded Admin Orders Query

- **File:** `src/app/api/admin/orders/route.ts`
- **Root cause:** Deeply nested eager loading with no page size limit.
- **Fix:** Always pass `.range()` from search params.

### 12. ✅ ReviewBadge Creates N+1 API Calls Per Grid

- **File:** `src/components/products/ReviewBadge.tsx` (lines 13–18)
- **Root cause:** Every `ProductCard` independently fires `fetch(/api/products/${productId}/reviews)`.
- **Fix:** Batch-fetch ratings server-side and pass as props.

### 13. ✅ No HTTP Caching Headers on Any API Route

- **Files:** All 21 API route files
- **Root cause:** No `Cache-Control`, `ETag`, or `Last-Modified` headers.
- **Fix:** Add caching headers to categories, products endpoints.

### 14. ✅ Broad Middleware Matcher Includes API Routes

- **File:** `middleware.ts` (lines 9–11)
- **Root cause:** Middleware runs on every API request, duplicate auth check.
- **Fix:** Add `/api/:path*` to exclusion pattern.

### 15. ✅ Missing Image Optimization Config

- **File:** `next.config.mjs`
- **Missing:** `formats: ['image/avif', 'image/webp']`, `minimumCacheTTL`, tuned `deviceSizes`
- **Fix:** Add modern format support and longer cache TTL.

### 16. ✅ No `priority` on Above-the-Fold Images

- **Files:** `src/components/products/ProductCard.tsx`, homepage hero
- **Root cause:** LCP images not preloaded.
- **Fix:** Pass `priority` on first product card(s) and hero.

---

## Medium

### 17. Unnecessary `use client` — WhyShopSection

- **File:** `src/components/layout/WhyShopSection.tsx`
- **Fix:** Remove `'use client'`.

### 18. Missing `use client` — button.tsx

- **File:** `src/components/ui/button.tsx`
- **Root cause:** Imports `@base-ui/react/button` (client library) without `'use client'`.
- **Fix:** Add `'use client'`.

### 19. Real-time Stock Subscription Per Card

- **File:** `src/hooks/useRealtimeStock.ts`, used in `ProductCard.tsx`
- **Root cause:** Each card creates its own Supabase Realtime channel.
- **Fix:** Subscribe once at the page level.

### 20. Missing React.memo on List Components

- **Files:** `ProductCard.tsx`, `CartItem.tsx`, `ReviewBadge.tsx`, `StockBadge.tsx`, `AddressCard.tsx`
- **Fix:** Wrap in `React.memo`.

### 21. Missing useMemo for Derived State

- **Files:** `src/hooks/useCart.ts` (lines 112–113), `src/app/admin/page.tsx` (lines 30–35)
- **Fix:** Add `useMemo` wrappers.

### 22. Context Provider Cascade

- **File:** `src/app/layout.tsx`
- **Root cause:** `AuthProvider > CartProvider > WishlistProvider` wrapping entire app.
- **Fix:** Consider splitting providers or using Zustand.

### 23. Auth Re-checked in Every Protected API Route

- **Pattern in** 15 of 21 route files
- **Fix:** Create a `withAuth()` helper.

### 24. Semantic Search — SimilarProducts Runs Client-Side API Call

- **File:** `src/components/products/SimilarProducts.tsx`
- **Fix:** Prefetch similar products server-side.

### 25. framer-motion Heavy Usage

- **Files:** 18+ components
- **Bundle impact:** ~35KB gzipped
- **Fix:** Replace decorative animations with CSS.

### 26. recharts — Heavy for Single Admin Page

- **File:** `src/app/admin/page.tsx`
- **Bundle impact:** ~40KB gzipped
- **Fix:** Use `next/dynamic()`.

### 27. Missing `SELECT *` Reduction in Count Queries

- **Files:** Multiple routes use `select('*', { count: 'exact', head: true })`
- **Fix:** Change to `select('id', ...)`.

### 28. Inline Function Definitions in map() Callbacks

- **Files:** 15+ components/pages
- **Fix:** Extract list rendering to sub-components.

---

## Low

### 29. boneyard-js Inconsistent with CSS Skeletons

- **Files:** Admin pages import `<Skeleton>` from `boneyard-js`, rest use CSS
- **Fix:** Remove `boneyard-js`, use existing CSS shimmer.

### 30. shadcn in Production Dependencies

- **File:** `package.json`
- **Fix:** Move to `devDependencies`.

### 31. No Input Validation Library

- **Fix:** Add Zod for all POST/PATCH routes.

### 32. Split `profile/page.tsx` into Sub-components

- **File:** `src/app/profile/page.tsx` (768 lines)
- **Fix:** Extract `ProfileCard`, `QuickLinks`, `AddressSection`.

### 33. No Connection Pool Limits

- **Fix:** Ensure `createClient()` is reused per request.

---

## Implementation Order

1. Add IVFFlat index on `products.embedding`
2. Rewrite `admin/stats/route.ts` with SQL aggregates
3. Fix duplicate product query in `products/[id]/page.tsx`
4. Add FK indexes (user_id, category_id, status, etc.)
5. Fix double category lookup in products route + page
6. Add pagination to `api/orders/route.ts`
7. Remove `'use client'` from `WhyShopSection.tsx`
8. Add `'use client'` to `button.tsx`
9. Parallelize reviews query in `reviews/route.ts`
10. Batch stock decrement in stripe webhook
11. Add batch cart clear endpoint
12. Add missing FK indexes
13. Add format config to next.config
14. Exclude `/api/*` from middleware matcher
15. Add caching headers to categories/products API
16. Add React.memo to ProductCard, CartItem, StockBadge, etc.
17. Add useMemo for cartCount/cartTotal
18. Add priority to LCP images
19. Dynamic import recharts in admin page
20. Prefetch similar products server-side
21. Move shadcn to devDependencies
22. Replace boneyard-js with CSS skeletons
23. Replace decorative framer-motion with CSS
24. Add Zod validation to POST/PATCH routes
25. Split profile/page.tsx into sub-components
