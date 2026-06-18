-- migrate:up
-- Enable Realtime for the products table
-- Required for live stock count updates via Supabase Realtime

ALTER TABLE products REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE products;


-- migrate:down
