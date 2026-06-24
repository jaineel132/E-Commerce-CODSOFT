# API Reference

Base path: `/api`

---

## Public

### GET /api/products
Query params: `category` (slug), `minPrice`, `maxPrice`, `page` (default 1), `limit` (default 20), `sortBy` (created_at|price|name), `sortOrder` (asc|desc). Returns paginated product list with category data. Cached (300s)

### GET /api/products/[id]
Returns single product with category data. Cached (1800s).

### GET /api/products/[id]/reviews
Returns reviews for a product with user profile data.

### GET /api/categories
Returns categories with product count. Cached (3600s).

### POST /api/search
Body: `{ query: string, page?: number, limit?: number }`. Returns paginated semantic search results with similarity scores. Cached in Redis (300s TTL).

---

## Protected (Auth Required)

### Cart
| Method | Path | Body / Params |
|--------|------|---------------|
| GET | /api/cart | — |
| POST | /api/cart | `{ product_id }` (upserts quantity +1 if exists) |
| PATCH | /api/cart | `{ product_id, quantity }` |
| DELETE | /api/cart | `{ product_id }` or `?all=true` (clear entire cart) |

### Checkout
| Method | Path | Body |
|--------|------|------|
| POST | /api/checkout | `{ address_id }` (creates Stripe session, returns URL) |

### Orders
| Method | Path | Params |
|--------|------|--------|
| GET | /api/orders | `?page&limit` (user's orders, paginated) |

### Wishlist
| Method | Path | Body |
|--------|------|------|
| GET | /api/wishlist | — |
| POST | /api/wishlist | `{ product_id }` |
| DELETE | /api/wishlist | `{ product_id }` |

### Profile
| Method | Path | Body |
|--------|------|------|
| GET | /api/profile | — |
| PATCH | /api/profile | `{ full_name }` |

### Addresses
| Method | Path | Body |
|--------|------|------|
| GET | /api/addresses | — |
| POST | /api/addresses | Full address object |
| PATCH | /api/addresses/[id] | Partial address fields |
| DELETE | /api/addresses/[id] | — |

### Recently Viewed
| Method | Path | Body |
|--------|------|------|
| GET | /api/recently-viewed | — |
| POST | /api/recently-viewed | `{ product_id }` |

### Reviews
| Method | Path | Body |
|--------|------|------|
| POST | /api/products/[id]/reviews | `{ rating, title?, body? }` |

---

## Admin (Admin Role Required)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/admin/stats | Dashboard: totalRevenue, totalOrders, totalProducts, ordersByDay[], topProducts[] |
| GET | /api/admin/orders | All orders (paginated, filterable by status) |
| PATCH | /api/admin/orders/[id] | Update status, tracking_number, tracking_carrier, notes |
| POST | /api/products | Create product (name, description, price, category_id, image_url, stock_count, is_active) |
| PATCH | /api/products/[id] | Update product (partial) |
| DELETE | /api/products/[id] | Delete product |
| POST | /api/products/[id]/embedding | Regenerate embedding |

---

## Webhook

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/webhooks/stripe | Stripe event handler. Signature-verified via `STRIPE_WEBHOOK_SECRET`. Processes `checkout.session.completed` — creates order, order_items, decrements stock, clears cart. Idempotent (skips if `stripe_session` already exists). |

---

## Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Validation error (Zod) or missing data |
| 401 | Unauthenticated |
| 403 | Forbidden (not admin) |
| 404 | Not found |
| 409 | Stock conflict (insufficient stock) |
| 429 | Rate limited (check `Retry-After` header) |
| 500 | Internal server error |

---

## Rate Limiting

- **IP-based**: 30 requests per 60s window (all API routes)
- **User-based**: 100 requests per 60s window (authenticated actions)
- Graceful degradation: disabled if Redis unavailable
