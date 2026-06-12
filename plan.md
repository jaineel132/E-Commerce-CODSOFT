# Build Plan — E-Commerce Website
## Level 3, Task 1

> **Rule:** Complete one phase fully before moving to the next. Don't start Phase 3 if Phase 2 has bugs. Each phase ends with a working, testable checkpoint.

---

## How to Work

- Work on **one task at a time** — don't jump ahead
- After every task, **test it manually** before marking done
- **Commit to Git** after each completed task with a clear message
- If something is broken, **fix it before moving on** — don't stack bugs

```
Commit message format:
feat: add product listing page
fix: cart not updating on quantity change
chore: add Supabase types generation script
```

---

## Phase 0 — Project Setup
*Goal: Working Next.js project connected to Supabase, nothing broken*

- [ ] **0.1** — Create Next.js 14 app with TypeScript and Tailwind
  ```bash
  npx create-next-app@latest ecommerce-app --typescript --tailwind --app
  ```

- [ ] **0.2** — Install all dependencies at once
  ```bash
  npm install @supabase/supabase-js @supabase/ssr stripe @stripe/stripe-js
  npm install clsx tailwind-merge lucide-react recharts
  npm install -D supabase
  ```

- [ ] **0.3** — Create `.env.local` with all env var placeholders (values come later)

- [ ] **0.4** — Set up Supabase project on supabase.com, copy URL + anon key to `.env.local`

- [ ] **0.5** — Create `src/lib/supabase/client.ts` and `src/lib/supabase/server.ts`

- [ ] **0.6** — Create `src/lib/utils.ts` with `cn()` helper function

- [ ] **0.7** — Create `src/types/index.ts` with all TypeScript interfaces (Product, CartItem, Order, OrderItem, Profile, WishlistItem)

- [ ] **0.8** — Set up folder structure as per architecture doc (create all empty folders)

- [ ] **0.9** — Configure `tailwind.config.js` for dark mode (`darkMode: 'class'`)

- [ ] **0.10** — Push to GitHub, confirm `.env.local` is in `.gitignore`

**✅ Checkpoint:** `npm run dev` works, no errors, blank page loads at localhost:3000

---

## Phase 1 — Database Setup
*Goal: All tables created, RLS enabled, test data seeded*

- [ ] **1.1** — Enable `pgvector` extension in Supabase dashboard (Database → Extensions → vector)

- [ ] **1.2** — Write and run `001_init_tables.sql`
  - Create: `profiles`, `products`, `cart_items`, `orders`, `order_items`, `wishlist_items`, `recently_viewed`
  - Run in Supabase SQL Editor

- [ ] **1.3** — Write and run `002_rls_policies.sql`
  - Enable RLS on every table
  - Add all policies as per architecture doc

- [ ] **1.4** — Write and run `003_pgvector_setup.sql`
  - Add `embedding vector(1536)` column to products
  - Create the `match_products` RPC function for similarity search

- [ ] **1.5** — Write and run `004_recently_viewed.sql`
  - Create `recently_viewed` table with unique constraint on (user_id, product_id)

- [ ] **1.6** — Write and run `005_seed_products.sql`
  - Insert 10–15 sample products across 3–4 categories (Electronics, Clothing, Books, etc.)
  - Leave `embedding` column null for now (will be populated in Phase 6)

- [ ] **1.7** — Generate Supabase TypeScript types
  ```bash
  npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
  ```

- [ ] **1.8** — Test queries manually in Supabase Table Editor — confirm data looks right

**✅ Checkpoint:** All tables exist, RLS is on, 10+ products visible in Table Editor

---

## Phase 2 — Authentication
*Goal: Users can sign up, log in, log out. Google OAuth works.*

- [ ] **2.1** — Set up Supabase Auth in dashboard
  - Enable Email provider
  - Enable Google OAuth (create Google Cloud credentials)
  - Add redirect URLs: `http://localhost:3000/api/auth/callback`

- [ ] **2.2** — Create `src/app/api/auth/callback/route.ts` — handles OAuth redirect

- [ ] **2.3** — Create `src/app/(auth)/signup/page.tsx`
  - Form: email + password + full name
  - Calls `supabase.auth.signUp()`
  - On success → redirect to `/products`

- [ ] **2.4** — Create `src/app/(auth)/login/page.tsx`
  - Form: email + password
  - Google OAuth button
  - Calls `supabase.auth.signInWithPassword()` or `signInWithOAuth()`

- [ ] **2.5** — Create `src/hooks/useUser.ts` — returns current session/user

- [ ] **2.6** — Create `AuthContext` in `src/context/AuthContext.tsx` — wrap `layout.tsx`

- [ ] **2.7** — Create `middleware.ts` at root
  - Protect `/cart`, `/checkout`, `/orders`, `/wishlist`, `/recently-viewed` → redirect to `/login` if not authed
  - Protect `/admin` → redirect to `/` if not admin role

- [ ] **2.8** — Add a trigger in Supabase: when new user signs up → auto-insert into `profiles` table

- [ ] **2.9** — Create a basic `Navbar.tsx` with Login/Logout button that reflects auth state

**✅ Checkpoint:** Sign up → verify email → log in → see logged-in state in navbar → log out

---

## Phase 3 — Product Listing & Detail Pages
*Goal: Users can browse and view products. Filters work.*

- [ ] **3.1** — Create `src/app/api/products/route.ts`
  - GET: fetch all active products (explicit columns, no `embedding`)
  - Supports `?category=` and `?minPrice=&maxPrice=` query params

- [ ] **3.2** — Create `src/app/api/products/[id]/route.ts`
  - GET: fetch single product by ID

- [ ] **3.3** — Create `src/components/products/ProductCard.tsx`
  - Shows: image, name, price, category, stock badge
  - "Add to Cart" button (disabled if out of stock)

- [ ] **3.4** — Create `src/components/products/StockBadge.tsx`
  - "In Stock" (green) / "Only N left" (orange, if ≤5) / "Out of Stock" (red)

- [ ] **3.5** — Create `src/components/products/ProductGrid.tsx`
  - Responsive grid: 1 col mobile → 2 col tablet → 3–4 col desktop

- [ ] **3.6** — Create `src/components/products/ProductFilter.tsx`
  - Category checkboxes
  - Price range slider (min/max)
  - "Clear filters" button

- [ ] **3.7** — Create `src/app/products/page.tsx`
  - Server Component: fetches products with applied filters
  - Renders `ProductFilter` + `ProductGrid`

- [ ] **3.8** — Create `src/app/products/[id]/page.tsx`
  - Shows: large image, full description, price, stock, category
  - "Add to Cart" button
  - "Add to Wishlist" button

- [ ] **3.9** — Create `src/components/layout/HeroBanner.tsx`
  - Full-width hero with headline, subtitle, CTA button linking to `/products`
  - Responsive image or gradient background

- [ ] **3.10** — Update `src/app/page.tsx` (homepage)
  - Render `HeroBanner` at top
  - "Featured Products" section — show 8 products
  - Link to `/products` for full catalog

- [ ] **3.11** — Create `src/components/layout/Footer.tsx`

**✅ Checkpoint:** Products page loads, filters work, clicking a product shows detail page

---

## Phase 4 — Shopping Cart
*Goal: Users can add, remove, update items in their cart. Cart persists after refresh.*

- [ ] **4.1** — Create `src/app/api/cart/route.ts`
  - GET: fetch cart items for current user (join with products for name/price/image)
  - POST: add item to cart (upsert — increase qty if already exists)
  - DELETE: remove item from cart

- [ ] **4.2** — Create `src/hooks/useCart.ts`
  - Functions: `addToCart(productId)`, `removeFromCart(productId)`, `updateQuantity(productId, qty)`, `clearCart()`
  - State: `cartItems`, `cartCount`, `cartTotal`

- [ ] **4.3** — Create `CartContext` in `src/context/CartContext.tsx` — wrap in `layout.tsx`

- [ ] **4.4** — Create `src/components/cart/CartItem.tsx`
  - Shows: image, name, price, quantity selector (+/- buttons), remove button
  - Calls `updateQuantity` and `removeFromCart` from context

- [ ] **4.5** — Create `src/components/cart/CartSummary.tsx`
  - Shows: subtotal, item count
  - "Proceed to Checkout" button

- [ ] **4.6** — Create `src/app/cart/page.tsx`
  - Lists all cart items using `CartItem`
  - Shows `CartSummary` on the right
  - "Continue Shopping" link back to `/products`
  - Empty cart state with illustration

- [ ] **4.7** — Update `Navbar.tsx` — show cart icon with live item count badge

- [ ] **4.8** — Wire "Add to Cart" buttons in `ProductCard` and product detail page to `useCart`

**✅ Checkpoint:** Add product → cart count updates in navbar → visit /cart → see items → remove item → cart updates

---

## Phase 5 — Checkout & Orders
*Goal: Users can pay with Stripe test card. Orders are saved in DB.*

- [ ] **5.1** — Create Stripe account at stripe.com, copy test keys to `.env.local`

- [ ] **5.2** — Create `src/lib/stripe.ts` — initialize Stripe client

- [ ] **5.3** — Create `src/app/api/checkout/route.ts`
  - POST: receive cart items → create Stripe Checkout Session
  - Set success URL: `/checkout/success?session_id={CHECKOUT_SESSION_ID}`
  - Set cancel URL: `/cart`

- [ ] **5.4** — Create `src/app/checkout/page.tsx`
  - Shows order summary (items + totals)
  - "Pay Now" button → calls `/api/checkout` → redirects to Stripe

- [ ] **5.5** — Create `src/app/api/webhooks/stripe/route.ts`
  - Verify Stripe signature
  - On `checkout.session.completed`:
    1. Create `orders` record
    2. Create `order_items` records
    3. Clear user's cart in `cart_items`

- [ ] **5.6** — Set up Stripe webhook in dashboard
  - Local: use Stripe CLI → `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
  - Add webhook secret to `.env.local`

- [ ] **5.7** — Create `src/app/checkout/success/page.tsx`
  - "Order confirmed!" message
  - Show order summary
  - Link to `/orders`

- [ ] **5.8** — Create `src/app/api/orders/route.ts`
  - GET: fetch all orders for current user (with order_items joined)

- [ ] **5.9** — Create `src/app/orders/page.tsx`
  - List all past orders: date, total, status badge, items

**✅ Checkpoint:** Add to cart → checkout → use Stripe test card `4242 4242 4242 4242` → success page → order appears in /orders

---

## Phase 6 — AI Semantic Search (Unique Feature 1)
*Goal: Users can search in natural language and get relevant results.*

- [ ] **6.1** — Create OpenAI account, generate API key, add to `.env.local`

- [ ] **6.2** — Create `src/lib/embeddings.ts`
  - `generateEmbedding(text: string): Promise<number[]>` using `text-embedding-3-small`

- [ ] **6.3** — Create `src/app/api/search/route.ts`
  - POST: receive `{ query: string }`
  - Generate embedding for query
  - Call Supabase RPC `match_products(embedding, 0.75, 10)`
  - Return matched products

- [ ] **6.4** — Update `src/app/api/products/route.ts` (POST/admin)
  - After inserting a product → auto-generate embedding from name + description
  - Save embedding to `products.embedding`

- [ ] **6.5** — Create a one-time script to **backfill embeddings** for existing seeded products
  - Loop through all products → generate + save embeddings

- [ ] **6.6** — Create `src/components/products/SearchBar.tsx`
  - Input with debounce (300ms)
  - Shows "Searching..." spinner while fetching
  - On results → calls a callback to update product list

- [ ] **6.7** — Integrate `SearchBar` into `src/app/products/page.tsx`
  - When search has results → show them instead of filtered products
  - When search is cleared → revert to normal product list

- [ ] **6.8** — Add to `Navbar.tsx` — search bar visible on desktop, icon on mobile

**✅ Checkpoint:** Type "something warm for winter" → relevant clothing products appear without exact name match

---

## Phase 7 — Real-Time Stock Updates (Unique Feature 2)
*Goal: Stock count updates live across all open tabs without refresh.*

- [ ] **7.1** — Create `src/hooks/useRealtimeStock.ts`
  - Subscribe to Supabase Realtime on `products` table, `UPDATE` events
  - Returns updated stock count for a given product ID

- [ ] **7.2** — Update `StockBadge.tsx` to use `useRealtimeStock` hook
  - Replace static stock count with live-updating value

- [ ] **7.3** — Update `ProductCard.tsx` and product detail page to use real-time badge

- [ ] **7.4** — Test: open two browser tabs → update stock in Supabase Table Editor directly → both tabs update without refresh

- [ ] **7.5** — Enable Supabase Realtime on `products` table in dashboard (Database → Replication)

**✅ Checkpoint:** Two tabs open → change stock in Supabase → both tabs reflect new stock count in under 2 seconds

---

## Phase 8 — Wishlist & Recently Viewed
*Goal: Users can save products and see browsing history.*

- [ ] **8.1** — Create `src/app/api/wishlist/route.ts`
  - GET: fetch wishlist items for user
  - POST: add product to wishlist
  - DELETE: remove from wishlist

- [ ] **8.2** — Create `src/hooks/useWishlist.ts`
  - Functions: `addToWishlist`, `removeFromWishlist`, `isInWishlist(id)`

- [ ] **8.3** — Update product detail page — wire "Add to Wishlist" button

- [ ] **8.4** — Add wishlist heart icon to `ProductCard.tsx` (filled if in wishlist)

- [ ] **8.5** — Create `src/app/wishlist/page.tsx` — list all saved products

- [ ] **8.6** — Create `src/app/api/recently-viewed/route.ts`
  - POST: upsert recently_viewed entry (update viewed_at), delete entries beyond 6 most recent
  - GET: fetch last 6 recently viewed products for current user (joined with products table)

- [ ] **8.7** — Create `src/hooks/useRecentlyViewed.ts`
  - Functions: `addToRecentlyViewed(productId)`, `getRecentlyViewed()`
  - Calls `/api/recently-viewed` on product page visit

- [ ] **8.8** — Create `src/components/products/RecentlyViewed.tsx`
  - Horizontal scrollable row of product cards
  - Shows last 6 viewed products

- [ ] **8.9** — Wire product detail page — call `addToRecentlyViewed` on mount

- [ ] **8.10** — Show `RecentlyViewed` section on homepage for logged-in users

**✅ Checkpoint:** Click wishlist heart → product saved → /wishlist shows it → visit products → recently viewed appears on homepage

---

## Phase 9 — Admin Dashboard
*Goal: Admin can manage products and view orders.*

- [ ] **9.1** — Create `src/app/admin/layout.tsx`
  - Sidebar: links to Dashboard, Products, Orders
  - Check user role — render nothing and redirect if not admin

- [ ] **9.2** — Create `src/app/admin/page.tsx`
  - Overview cards: total products, total orders, total revenue
  - Simple bar chart (Recharts) — orders per day for the last 7 days

- [ ] **9.3** — Create `src/components/admin/ProductForm.tsx`
  - Fields: name, description, price, category, stock count, image upload
  - Image uploads to Supabase Storage

- [ ] **9.4** — Create `src/app/admin/products/page.tsx`
  - Table of all products with Edit and Delete buttons

- [ ] **9.5** — Create `src/app/admin/products/new/page.tsx`
  - Uses `ProductForm` for new product creation
  - On save → embedding auto-generated, product goes live

- [ ] **9.6** — Add edit functionality — clicking Edit opens `ProductForm` pre-filled

- [ ] **9.7** — Create `src/app/api/orders/[id]/route.ts`
  - PATCH: update order status (admin only, checks role server-side)

- [ ] **9.8** — Create `src/components/admin/OrderTable.tsx`
  - Columns: Order ID, User, Date, Total, Status (dropdown to update)

- [ ] **9.9** — Create `src/app/admin/orders/page.tsx`
  - Uses `OrderTable`
  - Admin can change order status (Pending → Shipped → Delivered) via PATCH

- [ ] **9.10** — Set your own account as admin
  ```sql
  UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
  ```

**✅ Checkpoint:** Log in as admin → /admin loads → add new product → it appears on /products → update order status → it reflects in user's /orders

---

## Phase 10 — UI Polish & Dark Mode
*Goal: App looks great, dark mode works everywhere, no rough edges.*

- [ ] **10.1** — Create `src/components/layout/ThemeToggle.tsx`
  - Saves preference to `localStorage`
  - Applies `dark` class to `<html>` element

- [ ] **10.2** — Add dark mode variants to every component — go through each file and add `dark:` classes

- [ ] **10.3** — Create `Skeleton.tsx` loading components — add to product grid while data loads

- [ ] **10.4** — Create `Toast.tsx` notification — show on: add to cart, add to wishlist, checkout success, errors

- [ ] **10.5** — Create `src/components/ui/EmptyState.tsx`
  - Reusable component: icon, title, description, optional action button
  - Used by: empty cart, empty wishlist, no search results

- [ ] **10.6** — Wire `EmptyState` into cart, wishlist, orders, and search results pages

- [ ] **10.7** — Make all pages fully responsive — test on 375px (iPhone SE), 768px (tablet), 1280px (desktop)

- [ ] **10.8** — Add `<head>` meta tags to main pages — title, description for basic SEO

- [ ] **10.9** — Add product image fallback — if image fails to load, show placeholder

**✅ Checkpoint:** Dark mode toggle works → no white flash on theme change → mobile layout looks clean

---

## Phase 11 — Deployment
*Goal: Live on Vercel with a public URL.*

- [ ] **11.1** — Push final code to GitHub

- [ ] **11.2** — Create Vercel account → Import GitHub repo

- [ ] **11.3** — Add all env variables in Vercel dashboard (same as `.env.local`)

- [ ] **11.4** — Update Supabase Auth redirect URLs to include your Vercel domain

- [ ] **11.5** — Update Stripe webhook URL to your Vercel domain + `/api/webhooks/stripe`

- [ ] **11.6** — Deploy — fix any build errors (check Vercel build logs)

- [ ] **11.7** — Test the full flow on the live URL — sign up → add to cart → checkout → orders

- [ ] **11.8** — Write `README.md`
  - Project description
  - Live URL
  - Tech stack
  - How to run locally
  - Screenshots of key pages

**✅ Final Checkpoint:** Share the live Vercel URL — the full flow works end to end in production

---

## Summary Timeline (estimated)

| Phase | What | Est. Time |
|---|---|---|
| 0 | Setup | 1–2 hours |
| 1 | Database | 2–3 hours |
| 2 | Auth | 3–4 hours |
| 3 | Products | 4–5 hours |
| 4 | Cart | 3–4 hours |
| 5 | Checkout + Orders | 4–5 hours |
| 6 | AI Search ⭐ | 3–4 hours |
| 7 | Realtime Stock ⭐ | 1–2 hours |
| 8 | Wishlist | 2–3 hours |
| 9 | Admin | 4–5 hours |
| 10 | Polish | 2–3 hours |
| 11 | Deploy | 1–2 hours |
| **Total** | | **~32–42 hours** |

> Build phases 0–5 first for a working MVP. Phases 6–7 are the unique features that will get you the internship extension.
