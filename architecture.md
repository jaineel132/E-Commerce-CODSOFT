# Architecture Document
## E-Commerce Website — Level 3, Task 1

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│         Next.js 14 App (React Server Components)        │
└──────────────────┬──────────────────────────────────────┘
                   │  HTTP / WebSocket
┌──────────────────▼──────────────────────────────────────┐
│                   Next.js API Routes                     │
│              (/api/*)  — Server-side logic               │
│         Stripe webhooks · Cart · Orders · Search        │
└────────────┬────────────────────────┬───────────────────┘
             │                        │
┌────────────▼──────────┐  ┌──────────▼──────────────────┐
│   Supabase (Backend)  │  │         Stripe API           │
│                       │  │   (Payments / Webhooks)      │
│  • PostgreSQL DB      │  └─────────────────────────────┘
│  • Auth (JWT + OAuth) │
│  • Storage (images)   │  ┌─────────────────────────────┐
│  • Realtime           │  │     OpenAI API (optional)    │
│  • pgvector           │  │   text-embedding-3-small     │
└───────────────────────┘  └─────────────────────────────┘
```

---

## 2. Folder Structure

```
ecommerce-app/
│
├── .env.local                    # All secrets — NEVER commit this
├── .env.example                  # Template showing which vars are needed
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
│
├── public/
│   ├── favicon.ico
│   └── placeholder-product.png   # Fallback image for products
│
├── supabase/
│   ├── migrations/               # SQL migration files (run in order)
│   │   ├── 001_init_tables.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_pgvector_setup.sql
│   │   ├── 004_recently_viewed.sql
│   │   └── 005_seed_products.sql
│   └── seed.ts                   # Optional: script to seed test data
│
├── src/
│   │
│   ├── app/                      # Next.js 14 App Router
│   │   │
│   │   ├── layout.tsx            # Root layout (fonts, providers, navbar)
│   │   ├── page.tsx              # Homepage — featured products, hero
│   │   ├── globals.css           # Tailwind base + custom CSS variables
│   │   │
│   │   ├── (auth)/               # Route group — no shared layout
│   │   │   ├── login/
│   │   │   │   └── page.tsx      # Login form
│   │   │   └── signup/
│   │   │       └── page.tsx      # Signup form
│   │   │
│   │   ├── products/
│   │   │   ├── page.tsx          # Product listing with filters + search
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Product detail page
│   │   │
│   │   ├── cart/
│   │   │   └── page.tsx          # Cart page with item list + totals
│   │   │
│   │   ├── checkout/
│   │   │   ├── page.tsx          # Stripe checkout page
│   │   │   └── success/
│   │   │       └── page.tsx      # Order confirmed page
│   │   │
│   │   ├── orders/
│   │   │   └── page.tsx          # User order history
│   │   │
│   │   ├── wishlist/
│   │   │   └── page.tsx          # Saved wishlist items
│   │   │
│   │   ├── admin/                # Protected — admin only
│   │   │   ├── layout.tsx        # Admin layout with sidebar
│   │   │   ├── page.tsx          # Admin dashboard overview
│   │   │   ├── products/
│   │   │   │   ├── page.tsx      # List all products (edit/delete)
│   │   │   │   └── new/
│   │   │   │       └── page.tsx  # Add new product form
│   │   │   └── orders/
│   │   │       └── page.tsx      # View + update all orders
│   │   │
│   │   └── api/                  # API Route Handlers
│   │       ├── auth/
│   │       │   └── callback/
│   │       │       └── route.ts  # Supabase OAuth callback
│   │       ├── cart/
│   │       │   └── route.ts      # GET, POST, DELETE cart items
│   │       ├── checkout/
│   │       │   └── route.ts      # POST create Stripe Checkout Session
│   │       ├── orders/
│   │       │   ├── route.ts      # GET all orders for current user
│   │       │   └── [id]/
│   │       │       └── route.ts  # PATCH update order status (admin)
│   │       ├── products/
│   │       │   ├── route.ts      # GET all, POST new product (admin)
│   │       │   └── [id]/
│   │       │       └── route.ts  # GET one, PATCH, DELETE (admin)
│   │       ├── search/
│   │       │   └── route.ts      # Semantic search with pgvector
│   │       ├── wishlist/
│   │       │   └── route.ts      # GET, POST, DELETE wishlist items
│   │       ├── recently-viewed/
│   │       │   └── route.ts      # POST save view, GET fetch recent
│   │       └── webhooks/
│   │           └── stripe/
│   │               └── route.ts  # Stripe webhook handler
│   │
│   ├── components/               # Reusable UI components
│   │   │
│   │   ├── ui/                   # Base-level dumb components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Skeleton.tsx      # Loading placeholders
│   │   │   ├── Toast.tsx         # Success/error notifications
│   │   │   └── EmptyState.tsx    # Empty cart / wishlist / search results
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx        # Top nav: logo, search, cart icon, user
│   │   │   ├── HeroBanner.tsx    # Homepage hero section
│   │   │   ├── Footer.tsx
│   │   │   └── ThemeToggle.tsx   # Dark/light mode button
│   │   │
│   │   ├── products/
│   │   │   ├── ProductCard.tsx   # Card shown in listing grid
│   │   │   ├── ProductGrid.tsx   # Responsive grid wrapper
│   │   │   ├── ProductFilter.tsx # Category + price filter sidebar
│   │   │   ├── SearchBar.tsx     # AI search input component
│   │   │   ├── StockBadge.tsx    # "In Stock" / "Only 3 left" badge
│   │   │   └── RecentlyViewed.tsx # Recently viewed section on homepage
│   │   │
│   │   ├── cart/
│   │   │   ├── CartItem.tsx      # Single row in cart
│   │   │   └── CartSummary.tsx   # Total + checkout button
│   │   │
│   │   └── admin/
│   │       ├── ProductForm.tsx   # Add/edit product form
│   │       └── OrderTable.tsx    # Table of all orders
│   │
│   ├── lib/                      # Utility functions and clients
│   │   ├── supabase/
│   │   │   ├── client.ts         # Supabase browser client
│   │   │   ├── server.ts         # Supabase server client (for API routes)
│   │   │   └── middleware.ts     # Auth session refresh helper
│   │   ├── stripe.ts             # Stripe client init
│   │   ├── embeddings.ts         # OpenAI embedding generation helper
│   │   └── utils.ts              # formatPrice, cn (classnames), etc.
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useCart.ts            # Cart state + actions
│   │   ├── useWishlist.ts        # Wishlist state + actions
│   │   ├── useRecentlyViewed.ts  # Recently viewed state + actions
│   │   ├── useRealtimeStock.ts   # Supabase Realtime stock listener
│   │   └── useUser.ts            # Current user from Supabase Auth
│   │
│   ├── context/
│   │   ├── CartContext.tsx       # Cart provider (wraps app)
│   │   └── AuthContext.tsx       # Auth state provider
│   │
│   └── types/
│       └── index.ts              # All TypeScript types / interfaces
│
└── middleware.ts                 # Next.js middleware — protect /admin routes
```

---

## 3. Database Schema

### `profiles` table
```sql
id          uuid  PRIMARY KEY  (references auth.users)
email       text  NOT NULL
full_name   text
avatar_url  text
role        text  DEFAULT 'customer'  -- 'customer' | 'admin'
created_at  timestamptz DEFAULT now()
```

### `products` table
```sql
id            uuid    PRIMARY KEY DEFAULT gen_random_uuid()
name          text    NOT NULL
description   text
price         numeric NOT NULL
category      text    NOT NULL
image_url     text
stock_count   int     DEFAULT 0
is_active     boolean DEFAULT true
embedding     vector(1536)           -- pgvector: for AI search
created_at    timestamptz DEFAULT now()
```

### `cart_items` table
```sql
id          uuid    PRIMARY KEY DEFAULT gen_random_uuid()
user_id     uuid    REFERENCES profiles(id) ON DELETE CASCADE
product_id  uuid    REFERENCES products(id) ON DELETE CASCADE
quantity    int     DEFAULT 1
created_at  timestamptz DEFAULT now()
UNIQUE(user_id, product_id)
```

### `orders` table
```sql
id              uuid    PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid    REFERENCES profiles(id)
stripe_session  text    NOT NULL
total_amount    numeric NOT NULL
status          text    DEFAULT 'pending'  -- pending | shipped | delivered
created_at      timestamptz DEFAULT now()
```

### `order_items` table
```sql
id          uuid    PRIMARY KEY DEFAULT gen_random_uuid()
order_id    uuid    REFERENCES orders(id) ON DELETE CASCADE
product_id  uuid    REFERENCES products(id)
quantity    int     NOT NULL
unit_price  numeric NOT NULL
```

### `wishlist_items` table
```sql
id          uuid  PRIMARY KEY DEFAULT gen_random_uuid()
user_id     uuid  REFERENCES profiles(id) ON DELETE CASCADE
product_id  uuid  REFERENCES products(id) ON DELETE CASCADE
created_at  timestamptz DEFAULT now()
UNIQUE(user_id, product_id)
```

### `recently_viewed` table
```sql
id          uuid    PRIMARY KEY DEFAULT gen_random_uuid()
user_id     uuid    REFERENCES profiles(id) ON DELETE CASCADE
product_id  uuid    REFERENCES products(id) ON DELETE CASCADE
viewed_at   timestamptz DEFAULT now()
UNIQUE(user_id, product_id)   -- upsert: update viewed_at on re-visit
```

---

## 4. Row Level Security (RLS) Policies

| Table | Policy | Rule |
|---|---|---|
| `profiles` | Read own profile | `auth.uid() = id` |
| `profiles` | Update own profile | `auth.uid() = id` |
| `products` | Anyone can read | `true` |
| `products` | Only admin can write | `role = 'admin'` |
| `cart_items` | Own cart only | `auth.uid() = user_id` |
| `orders` | Own orders only | `auth.uid() = user_id` |
| `orders` | Admin reads all | `role = 'admin'` |
| `wishlist_items` | Own wishlist only | `auth.uid() = user_id` |
| `recently_viewed` | Own recently viewed only | `auth.uid() = user_id` |

---

## 5. Key Data Flows

### AI Semantic Search
```
User types query
  → POST /api/search { query: "warm winter jacket" }
    → Generate embedding via OpenAI API (1536-dim vector)
    → Run Supabase RPC: match_products(query_embedding, threshold, count)
      → pgvector cosine similarity search on products.embedding
    → Return ranked products
```

### Real-time Stock Update
```
Admin updates stock in /admin
  → PATCH /api/products/:id { stock_count: 5 }
    → Supabase UPDATE products SET stock_count = 5
      → Supabase Realtime broadcasts change
        → All browser clients subscribed to products channel
          → StockBadge component re-renders with new count
```

### Recently Viewed
```
User visits a product detail page
  → POST /api/recently-viewed { product_id }
    → Upsert into recently_viewed table (updates viewed_at)
    → Cleanup: delete entries beyond the 6 most recent per user
  → Homepage loads for logged-in user
    → GET /api/recently-viewed
      → Query recently_viewed joined with products, ordered by viewed_at DESC, limit 6
      → Render RecentlyViewed component on homepage
```

### Stripe Checkout
```
User clicks "Pay Now"
  → POST /api/checkout (creates Stripe session)
    → Redirect to Stripe hosted checkout page
      → User pays with test card
        → Stripe redirects to /checkout/success?session_id=xxx
          → Stripe sends webhook to /api/webhooks/stripe
            → Webhook handler: create order + order_items in DB
            → Clear user's cart
```

---

## 6. Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # server-side only

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# OpenAI (for embeddings)
OPENAI_API_KEY=sk-xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 7. Middleware (Route Protection)

`middleware.ts` at the root runs on every request:

- If route starts with `/admin` → check user role from Supabase session → if not admin, redirect to `/`
- If route starts with `/cart`, `/checkout`, `/orders`, `/wishlist`, `/recently-viewed` → check auth → if not logged in, redirect to `/login`
- All other routes → public, no check needed
