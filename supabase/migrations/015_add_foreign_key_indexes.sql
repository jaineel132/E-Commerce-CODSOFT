-- migrate:up
-- Add missing foreign key indexes for query performance
-- These columns are used in JOINs, WHERE filters, and RLS policies

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);


-- migrate:down
