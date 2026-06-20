<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-000?logo=next.js&style=for-the-badge" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&style=for-the-badge" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&style=for-the-badge" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Supabase-FF4438?logo=supabase&style=for-the-badge" alt="Supabase" />
  <img src="https://img.shields.io/badge/Stripe-635BFF?logo=stripe&style=for-the-badge" alt="Stripe" />
  <img src="https://img.shields.io/badge/Gemini-8E75FF?logo=google&style=for-the-badge" alt="Gemini" />
  <img src="https://img.shields.io/badge/Upstash-00E098?logo=upstash&style=for-the-badge" alt="Upstash" />
</p>

<h1 align="center">Verdant · Modern E-Commerce</h1>

<p align="center">
  Full-stack e-commerce with <strong>AI semantic search</strong>, <strong>Stripe payments</strong>, and an <strong>admin dashboard</strong>.
  Built with Next.js 14, Supabase, PostgreSQL + pgvector, and Upstash Redis.
</p>

<p align="center">
  🌐 <a href="#live-demo"><strong>Live Demo</strong></a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#features">Features</a> •
  <a href="#tech-stack">Stack</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#docs">Docs</a>
</p>

---

## Live Demo

[https://verdant-mocha-six.vercel.app](https://verdant-mocha-six.vercel.app)

---

## Screenshots

| Landing | Products | Product Detail |
|:-------:|:--------:|:--------------:|
| <img src="public/screenshots/landing.png" width="280" alt="Landing"> | <img src="public/screenshots/products.png" width="280" alt="Products"> | <img src="public/screenshots/product-detail.png" width="280" alt="Detail"> |

| Cart | Checkout | Dashboard |
|:----:|:--------:|:---------:|
| <img src="public/screenshots/cart.png" width="280" alt="Cart"> | <img src="public/screenshots/checkout.png" width="280" alt="Checkout"> | <img src="public/screenshots/profile.png" width="280" alt="Profile"> |

| Admin Dashboard | Search Results |
|:---------------:|:--------------:|
| <img src="public/screenshots/admin-dashboard.png" width="280" alt="Admin"> | <img src="public/screenshots/search.png" width="280" alt="Search"> |

---

## Features

**Storefront** — Product catalog with category/price filters, sorting, pagination · AI-powered semantic search (Gemini embeddings + pgvector) · Cart & wishlist CRUD · Stripe Checkout with webhook-based order fulfillment · Order history with status tracking · Product reviews · Recently viewed tracking

**Auth** — Email/password + Google OAuth · JWT sessions via Supabase SSR · Middleware-enforced route protection · Password reset flow

**Admin** — Dashboard with revenue/chart stats (Recharts) · Product CRUD with image upload to Supabase Storage · Order management with status updates & tracking info · Triple-layer admin enforcement (middleware, server layout, API)

**Performance** — `unstable_cache` + tag-based revalidation · Redis search caching (300s TTL) · Server-side pagination · 10 database indexes (B-tree, partial, composite) · Image optimization (AVIF/WebP) · Skeleton loading · Rate limiting (IP + user)

---

## Unique Features

### 🔍 AI Semantic Search

Natural language search understands intent, not just keywords. Powered by Google Gemini embeddings + pgvector cosine similarity.

| You type… | It finds… |
|-----------|-----------|
| `"warm winter jackets"` | Leather jackets, hooded parkas, puffer coats |
| `"cozy bedtime reads"` | Fiction books, novels, paperbacks |
| `"wireless audio gear"` | Bluetooth headphones, earbuds, speakers |
| `"desk setup essentials"` | Monitors, keyboards, mouse pads, lamps |

Results are ranked by semantic similarity and automatically trimmed via **elbow filtering** — drops irrelevant tail results where the similarity gap between items exceeds 0.03. Search results are cached in Redis (300s TTL) for instant repeat queries.

### 🧠 Vector-Based Recommendations

Every product detail page shows **"You might also like"** — similar products found using the product's own embedding vector. The same `match_products()` pgvector function with a lower threshold (0.3) pulls up to 4 semantically related items.

### 📦 Real-Time Stock

Product detail pages show **live stock counts** via Supabase Realtime subscriptions. When stock changes (e.g., another purchase completes), the counter updates in real time without a page refresh.

### 🎯 Elbow Filtering

After fetching semantic search results, the API iterates through the ranked list and drops everything after a similarity gap >= 0.03. This means if results 1-3 are highly relevant (similarity 0.92, 0.90, 0.88) but result 4 drops to 0.72, only the first 3 are returned — no irrelevant clutter.

### ✨ Animated UI Details

- **Search bar** has a glowing animated border (`ai-search-glow` CSS) and animated loading dots during queries
- **Add to cart** triggers a "fly to cart" animation — the product image shrinks and flies into the cart icon
- **Page transitions** use Framer Motion with fade-in-up animations
- **Order confirmation** page has a confetti burst animation
- **Scroll-triggered reveals** using IntersectionObserver throughout the site

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 14.2 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3, Framer Motion, Lucide |
| **Database** | PostgreSQL 16 + pgvector |
| **Auth** | Supabase Auth (SSR, JWT, OAuth) |
| **Payments** | Stripe Checkout + Webhooks |
| **AI Search** | Gemini `gemini-embedding-001` (3072d) |
| **Cache / Rate Limit** | Upstash Redis |
| **Validation** | Zod |
| **Charts** | Recharts |
| **Storage** | Supabase Storage |
| **UI Library** | shadcn/ui, Sonner |

---

## Quick Start

```bash
git clone https://github.com/jaineel132/E-Commerce-CODSOFT.git
cd E-Commerce-CODSOFT
npm install
```

Set up `.env.local` (see full list in [docs](docs/ARCHITECTURE.md#environment-variables)):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
GOOGLE_GEMINI_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

```bash
npx supabase link --project-ref <your-ref>
npx supabase db push
npx tsx scripts/backfill-embeddings.ts
npm run dev
```

---

## Concepts Demonstrated

Next.js App Router · TypeScript · PostgreSQL · Supabase (Auth, DB, Storage, Realtime, RLS) · JWT Auth · Row Level Security · Stripe Checkout & Webhooks · Semantic Search (Gemini + pgvector) · Redis Caching & Rate Limiting · Database Indexing · Server-Side Pagination · Zod Validation · Image Optimization · Framer Motion · Recharts · Responsive Design · Dark Mode

---

## Docs

Detailed technical documentation:

| Doc | Contents |
|-----|---------|
| [Architecture](docs/ARCHITECTURE.md) | Auth flow, payment flow, search flow, middleware, env vars, folder structure |
| [Database](docs/DATABASE.md) | Schema, indexes, RLS policies, RPC functions, status flow |
| [API Reference](docs/API.md) | All routes with request/response shapes |

---

<p align="center">
  <sub>github.com/jaineel132/E-Commerce-CODSOFT</sub>
</p>
