# Product Requirements Document (PRD)
## E-Commerce Website — Level 3, Task 1

---

## 1. Overview

A full-stack e-commerce web application where users can browse products, add items to a cart, and complete purchases. The platform includes user authentication, product filtering, AI-powered semantic search, real-time stock updates, and a Stripe-integrated checkout flow.

**Tech Stack:** Next.js 14 (App Router) · Supabase (PostgreSQL + Auth + Storage + Realtime + pgvector) · Tailwind CSS · Stripe · Recharts

---

## 2. Goals

- Build a working, deployable e-commerce platform as part of the internship Level 3 requirement
- Demonstrate full-stack skills: frontend UI, backend API routes, database design, authentication, payments
- Stand out with two unique features: **AI semantic search** (pgvector) and **real-time stock updates** (Supabase Realtime)
- Keep code clean, well-structured, and documented for review

---

## 3. What This Project IS

| Feature | Description |
|---|---|
| User auth | Email/password signup + Google OAuth via Supabase Auth |
| Product catalog | Browse all products with images, price, category, stock count |
| Product detail page | Full product info, images, stock status, add to cart |
| AI semantic search | Natural language search using pgvector embeddings (e.g. "warm winter jacket" finds relevant products) |
| Category + price filter | Filter sidebar with category tags and price range slider |
| Shopping cart | Persistent cart stored in Supabase per user |
| Checkout | Stripe test-mode payment flow with order summary |
| Order history | User can view all past orders and their status |
| Wishlist | Save products to wishlist, synced per user account |
| Recently viewed | Auto-tracked per user session |
| Real-time stock | Product stock count updates live across all tabs (Supabase Realtime) |
| Admin dashboard | Protected admin route to add, edit, delete products and view all orders |
| Dark/light mode | Full theme toggle using Tailwind dark mode |
| Responsive design | Works on mobile, tablet, and desktop |

---

## 4. What This Project is NOT

| Out of Scope | Reason |
|---|---|
| Real payment processing | Using Stripe test mode only — no real money, no real cards |
| Multi-vendor marketplace | Single store, one admin — not an Amazon-style platform |
| Mobile app (iOS/Android) | Web only — Next.js PWA is acceptable but native apps are out of scope |
| Email notifications | No order confirmation emails (can be added later via Resend/SendGrid) |
| Shipping/logistics integration | No real shipping APIs — shipping is a static field only |
| Product reviews/ratings | Out of scope for this version |
| Multi-currency support | INR/USD only, no live currency conversion |
| Inventory management system | Admin can update stock manually — no automatic supplier sync |
| SSR-heavy SEO optimization | Basic SEO meta tags only, no full SEO strategy |
| Social media sharing | No OG image generation or share buttons |

---

## 5. User Roles

### Guest (not logged in)
- Browse products and search
- View product detail pages
- Cannot add to cart, wishlist, or checkout

### Customer (logged in)
- All guest permissions
- Add/remove items from cart
- Save to wishlist
- Complete checkout via Stripe
- View order history

### Admin
- All customer permissions
- Access `/admin` dashboard (protected route)
- Add, edit, delete products
- View all orders across all users
- Update order status (Pending → Shipped → Delivered)

---

## 6. Core User Flows

### Flow 1 — Browse & Purchase
1. User lands on homepage → sees featured products
2. Searches or filters products
3. Clicks product → views detail page
4. Adds to cart
5. Goes to cart → clicks checkout
6. Fills Stripe payment form (test card: 4242 4242 4242 4242)
7. Order confirmed → redirected to order success page
8. Order appears in order history

### Flow 2 — Admin adds a product
1. Admin logs in → navigates to `/admin`
2. Clicks "Add Product"
3. Fills form: name, description, price, category, images, stock
4. On save → embedding is auto-generated and stored in pgvector column
5. Product appears live on storefront

---

## 7. Key Technical Decisions

| Decision | Choice | Why |
|---|---|---|
| Framework | Next.js 14 App Router | Server components + API routes in one project |
| Database | Supabase PostgreSQL | Free tier, built-in auth, realtime, storage, pgvector |
| Auth | Supabase Auth | Zero-config, supports OAuth, row-level security |
| Payments | Stripe test mode | Industry standard, free to test, webhooks supported |
| AI Search | pgvector + OpenAI embeddings | Already inside Supabase, no extra infra needed |
| Styling | Tailwind CSS | Rapid UI development, dark mode built-in |
| Deployment | Vercel | Free tier, native Next.js support, env vars |
| State management | React Context + Supabase hooks | No need for Redux at this scale |

---

## 8. Non-Functional Requirements

- Page load under 2 seconds on desktop (Vercel edge network)
- Mobile-first responsive design (min-width: 320px)
- All Supabase tables must have Row Level Security (RLS) enabled
- No secrets or API keys committed to GitHub (use `.env.local`)
- Admin routes protected by middleware checking user role
- All forms must have client-side and basic server-side validation

---

## 9. Success Criteria

- [ ] A user can sign up, browse, add to cart, and complete a Stripe test checkout
- [ ] Semantic search returns relevant results for natural language queries
- [ ] Real-time stock update is visible without page refresh
- [ ] Admin can add a product and it appears live on the storefront
- [ ] Project is deployed and accessible via a public Vercel URL
- [ ] GitHub repo is clean with a proper README
