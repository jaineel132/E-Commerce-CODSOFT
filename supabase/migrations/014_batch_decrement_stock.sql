-- Batch stock decrement for Stripe webhook
-- Replaces N sequential RPC calls with a single call

CREATE OR REPLACE FUNCTION decrement_stock_batch(items jsonb)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products p
  SET stock_count = GREATEST(0, p.stock_count - (item->>'qty')::int)
  FROM jsonb_array_elements(items) AS item
  WHERE p.id = (item->>'pid')::uuid;
END;
$$;
