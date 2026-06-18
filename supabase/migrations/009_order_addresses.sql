-- migrate:up
-- =============================================
-- Add shipping/tracking fields to orders
-- =============================================
ALTER TABLE orders
  ADD COLUMN shipping_address_id uuid REFERENCES addresses(id),
  ADD COLUMN shipping_amount   numeric DEFAULT 0 CHECK (shipping_amount >= 0),
  ADD COLUMN tax_amount        numeric DEFAULT 0 CHECK (tax_amount >= 0),
  ADD COLUMN tracking_number   text,
  ADD COLUMN tracking_carrier  text,
  ADD COLUMN shipped_at        timestamptz,
  ADD COLUMN delivered_at      timestamptz,
  ADD COLUMN cancelled_at      timestamptz,
  ADD COLUMN notes             text;

-- Expand status check
ALTER TABLE orders DROP CONSTRAINT orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'));

-- =============================================
-- Atomic stock decrement function
-- =============================================
CREATE OR REPLACE FUNCTION public.decrement_stock(pid uuid, qty int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_stock int;
BEGIN
  SELECT stock_count INTO current_stock
  FROM products WHERE id = pid FOR UPDATE;

  IF current_stock IS NULL OR current_stock < qty THEN
    RETURN false;
  END IF;

  UPDATE products
  SET stock_count = stock_count - qty
  WHERE id = pid;

  RETURN true;
END;
$$;


-- migrate:down
