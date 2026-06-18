-- migrate:up
-- Add performance indexes for common query patterns

CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_products_is_active_created ON products(is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);


-- migrate:down
DROP INDEX IF EXISTS idx_orders_created_at;
DROP INDEX IF EXISTS idx_products_is_active_created;
DROP INDEX IF EXISTS idx_products_is_active;
