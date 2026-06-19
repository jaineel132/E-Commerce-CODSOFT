# Database Design

PostgreSQL 16 managed via Supabase. pgvector extension enabled for semantic search.

**10 tables** with Row Level Security, **4 RPC functions**, **11 indexes**, **3 triggers**.

---

## Tables

### profiles
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, FK → auth.users(id) ON DELETE CASCADE |
| email | text | NOT NULL |
| full_name | text | |
| avatar_url | text | |
| role | text | DEFAULT 'customer', CHECK (customer, admin) |
| created_at | timestamptz | DEFAULT now() |

Auto-created via trigger `on_auth_user_created` on `auth.users` INSERT.

### categories
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| name | text | NOT NULL |
| slug | text | UNIQUE |
| description | text | |
| image_url | text | |
| is_active | boolean | DEFAULT true |
| created_at | timestamptz | DEFAULT now() |

### products
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| name | text | NOT NULL |
| description | text | |
| price | numeric | NOT NULL, CHECK (>= 0) |
| category_id | uuid | FK → categories(id) |
| image_url | text | |
| stock_count | int | DEFAULT 0, CHECK (>= 0) |
| is_active | boolean | DEFAULT true |
| embedding | vector(3072) | |
| created_at | timestamptz | DEFAULT now() |

### cart_items
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK → profiles(id) ON DELETE CASCADE |
| product_id | uuid | FK → products(id) ON DELETE CASCADE |
| quantity | int | DEFAULT 1, CHECK (> 0) |
| created_at | timestamptz | DEFAULT now() |
| | | UNIQUE(user_id, product_id) |

### orders
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK → profiles(id) |
| stripe_session | text | NOT NULL |
| total_amount | numeric | NOT NULL, CHECK (>= 0) |
| status | text | DEFAULT 'pending', CHECK (pending, processing, shipped, delivered, cancelled, refunded) |
| shipping_address_id | uuid | FK → addresses(id) |
| shipping_amount | numeric | |
| tax_amount | numeric | |
| tracking_number | text | |
| tracking_carrier | text | |
| shipped_at | timestamptz | |
| delivered_at | timestamptz | |
| cancelled_at | timestamptz | |
| notes | text | |
| created_at | timestamptz | DEFAULT now() |

### order_items
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| order_id | uuid | FK → orders(id) ON DELETE CASCADE |
| product_id | uuid | FK → products(id) |
| quantity | int | NOT NULL, CHECK (> 0) |
| unit_price | numeric | NOT NULL, CHECK (>= 0) |

### wishlist_items
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK → profiles(id) ON DELETE CASCADE |
| product_id | uuid | FK → products(id) ON DELETE CASCADE |
| created_at | timestamptz | DEFAULT now() |
| | | UNIQUE(user_id, product_id) |

### recently_viewed
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK → profiles(id) ON DELETE CASCADE |
| product_id | uuid | FK → products(id) ON DELETE CASCADE |
| viewed_at | timestamptz | DEFAULT now() |
| | | UNIQUE(user_id, product_id) |

### addresses
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK → profiles(id) ON DELETE CASCADE |
| label | text | |
| full_name | text | |
| street | text | |
| city | text | |
| state | text | |
| zip_code | text | |
| country | text | |
| phone | text | |
| is_default | boolean | DEFAULT false |
| created_at | timestamptz | DEFAULT now() |

### reviews
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| product_id | uuid | FK → products(id) ON DELETE CASCADE |
| user_id | uuid | FK → profiles(id) ON DELETE CASCADE |
| rating | int | NOT NULL, CHECK (1-5) |
| title | text | |
| body | text | |
| is_verified_purchase | boolean | DEFAULT false |
| created_at | timestamptz | DEFAULT now() |
| | | UNIQUE(product_id, user_id) |

---

## Indexes

| Name | Table | Columns | Type |
|------|-------|---------|------|
| `addresses_single_default_idx` | addresses | user_id | Partial unique (WHERE is_default = true) |
| `idx_products_category_id` | products | category_id | B-tree |
| `idx_products_is_active` | products | is_active | Partial (WHERE is_active = true) |
| `idx_products_is_active_created` | products | is_active, created_at DESC | Composite |
| `idx_orders_user_id` | orders | user_id | B-tree |
| `idx_orders_status` | orders | status | B-tree |
| `idx_orders_created_at` | orders | created_at DESC | B-tree |
| `idx_order_items_order_id` | order_items | order_id | B-tree |
| `idx_order_items_product_id` | order_items | product_id | B-tree |
| `idx_reviews_product_id` | reviews | product_id | B-tree |
| `idx_profiles_role` | profiles | role | B-tree |

---

## Row Level Security

| Table | Select | Insert | Update | Delete |
|-------|--------|--------|--------|--------|
| profiles | own / admin | — | own | — |
| products | anyone | admin | admin | admin |
| categories | anyone | — | — | — |
| cart_items | own | own | own | own |
| orders | own / admin | — | admin | — |
| order_items | own (via JOIN) / admin | — | — | — |
| wishlist_items | own | own | own | own |
| recently_viewed | own | own | own | own |
| addresses | own / admin | own | own | own |
| reviews | anyone | auth (own) | own | own |

Helper function `is_admin()` (SECURITY DEFINER) checks `auth.uid() IN profiles WHERE role = 'admin'`.

---

## RPC Functions

### match_products(query_embedding vector(3072), match_threshold float, match_count int)
Semantic search via cosine distance:
```sql
1 - (products.embedding <=> query_embedding) AS similarity
```
Returns: id, name, description, price, category, image_url, stock_count, similarity. Filters: `is_active = true`, `embedding IS NOT NULL`, similarity > threshold. Ordered by distance, limited by match_count.

### is_admin()
Returns boolean — whether current user has role = 'admin'.

### decrement_stock(pid uuid, qty int)
Atomic stock decrement with `SELECT ... FOR UPDATE` row lock. Returns boolean success.

### decrement_stock_batch(items jsonb)
Batch version for webhook processing. Takes `[{ pid, qty }]` JSON array.

---

## Order Status Flow

```
pending → processing → shipped → delivered
    ↓          ↓
cancelled   refunded
```

---

## Realtime

`products` table added to `supabase_realtime` publication for live stock count updates on product detail pages via `useRealtimeStock()` hook.
