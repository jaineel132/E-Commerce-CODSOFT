<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-000000?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Supabase-FF4438?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe" alt="Stripe" />
  <img src="https://img.shields.io/badge/Gemini-8E75FF?style=for-the-badge&logo=google" alt="Gemini" />
  <img src="https://img.shields.io/badge/Upstash-00E098?style=for-the-badge&logo=upstash" alt="Upstash" />
</p>

<h1 align="center">Verdant — Modern E-Commerce Platform</h1>

<p align="center">
  Full-featured e-commerce with AI-powered semantic search, Stripe payments, and a complete admin dashboard. Built with Next.js 14, Supabase, and PostgreSQL.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#installation">Setup</a> •
  <a href="#concepts-demonstrated">Concepts</a>
</p>

---

## Features

- **Product Catalog** — Browse with category filters, price range, sorting, and pagination
- **AI Semantic Search** — Natural language product search via Google Gemini embeddings + pgvector (cosine similarity) + Redis-cached results
- **Cart & Wishlist** — Full CRUD, persists across sessions, quantity controls
- **Stripe Checkout** — Server-side session creation, shipping/tax calculation, webhook-based order fulfillment
- **Order History** — Status tracking with real-time stock updates via Supabase Realtime
- **Role-Based Access** — Customer and admin roles with middleware, API, and RLS enforcement
- **Admin Dashboard** — Revenue stats, orders-per-day chart (Recharts), product CRUD with image upload to Supabase Storage, order management with tracking info
- **User Profiles** — Manage addresses, avatar, recently viewed products
- **Reviews & Ratings** — Per-product reviews with verification
- **Authentication** — Email/password + Google OAuth via Supabase Auth, JWT sessions, password reset flow
- **Rate Limiting** — IP-based (30/60s) and user-based (100/60s) via Upstash Ratelimit
- **Performance** — `unstable_cache` with tag-based revalidation, image optimization (AVIF/WebP), server-side pagination, 10 database indexes, skeleton loading states

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14.2 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3, Framer Motion, Lucide |
| Database | PostgreSQL 16 (Supabase) + pgvector |
| Auth | Supabase Auth (SSR, JWT, Google OAuth) |
| Payments | Stripe (Checkout Sessions, Webhooks) |
| AI Search | Google Gemini (`gemini-embedding-001`, 3072d) |
| Cache / Rate Limit | Upstash Redis |
| Validation | Zod |
| Charts | Recharts |
| Storage | Supabase Storage |

---

## Architecture

**Frontend:** Hybrid SSR (server components for homepage, product listing, product detail) and CSR (api-route pattern for cart, checkout, orders, admin). React Context for auth, cart, and wishlist state. Suspense boundaries for lazy-loaded sections.

**Backend:** Next.js API routes with Supabase client (server + admin + public variants). Every route authenticates via `supabase.auth.getUser()`, validates with Zod, and applies rate limiting.

**Auth Flow:** Supabase SSR cookie-based JWT sessions. Middleware refreshes sessions and enforces route protection (`/cart`, `/checkout`, `/orders`, `/wishlist`, `/profile`, `/update-password`, `/admin/*`). Admin roles checked at middleware, server component layout, and API levels.

**Payment Flow:** `POST /api/checkout` creates a Stripe session (stock verification, shipping/tax calculation, metadata with user/address/products). Stripe webhook (`POST /api/webhooks/stripe`) with idempotency check creates the order, decrements stock atomically via `decrement_stock_batch()` RPC, and clears the cart.

**Search Flow:** User types query → 300ms debounce → `POST /api/search` → Redis cache check → Gemini embedding generation → `match_products()` pgvector function (cosine distance, threshold 0.5) → elbow filtering (drops results after gap ≥ 0.03) → cache result (300s TTL) → paginated response.

---

## Database

10 tables with Row Level Security: `profiles`, `categories`, `products` (with `vector(3072)` embedding), `cart_items`, `orders`, `order_items`, `wishlist_items`, `recently_viewed`, `addresses`, `reviews`.

Key RPC functions: `match_products()` (semantic search via cosine distance), `decrement_stock()` (atomic stock decrement with `FOR UPDATE`), `decrement_stock_batch()` (bulk webhook processing), `is_admin()` (role check).

---

## Screenshots

<div align="center">
  <table>
    <tr>
      <td><img src="public/screenshots/landing.png" alt="Landing" width="300"/></td>
      <td><img src="public/screenshots/products.png" alt="Products" width="300"/></td>
      <td><img src="public/screenshots/product-detail.png" alt="Product Detail" width="300"/></td>
    </tr>
    <tr>
      <td align="center">Landing Page</td>
      <td align="center">Product Listing</td>
      <td align="center">Product Details</td>
    </tr>
    <tr>
      <td><img src="public/screenshots/cart.png" alt="Cart" width="300"/></td>
      <td><img src="public/screenshots/checkout.png" alt="Checkout" width="300"/></td>
      <td><img src="public/screenshots/profile.png" alt="Profile" width="300"/></td>
    </tr>
    <tr>
      <td align="center">Cart</td>
      <td align="center">Checkout</td>
      <td align="center">User Dashboard</td>
    </tr>
    <tr>
      <td><img src="public/screenshots/admin-dashboard.png" alt="Admin" width="300"/></td>
      <td><img src="public/screenshots/search.png" alt="Search" width="300"/></td>
      <td></td>
    </tr>
    <tr>
      <td align="center">Admin Dashboard</td>
      <td align="center">Search Results</td>
      <td></td>
    </tr>
  </table>
</div>

---

## Installation

```bash
git clone https://github.com/jaineel132/E-Commerce-CODSOFT.git
cd E-Commerce-CODSOFT
npm install
```

Create `.env.local` with these variables:

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

Run migrations and seed:

```bash
npx supabase link --project-ref <your-ref>
npx supabase db push
npx tsx scripts/backfill-embeddings.ts
```

Start:

```bash
npm run dev
```

---

## Concepts Demonstrated

Next.js App Router · TypeScript · PostgreSQL · Supabase (Auth, DB, Storage, Realtime, RLS) · JWT Authentication · Row Level Security · Stripe Checkout & Webhooks · Semantic Search (Gemini Embeddings + pgvector) · Redis Caching & Rate Limiting (Upstash) · Database Indexing (B-tree, Partial, Composite) · Server-Side Pagination · Zod Validation · Image Optimization · Framer Motion Animations · Recharts · Responsive Design · Dark Mode · CI-ready (ESLint + TypeScript)

---

<div align="center">
  <sub>github.com/jaineel132/E-Commerce-CODSOFT</sub>
</div>
