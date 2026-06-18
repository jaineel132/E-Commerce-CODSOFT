-- migrate:up
-- =============================================
-- Helper function: check if current user is admin
-- =============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- =============================================
-- PROFILES
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =============================================
-- PRODUCTS
-- =============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Only admin can write products"
  ON products FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Only admin can update products"
  ON products FOR UPDATE
  USING (is_admin());

CREATE POLICY "Only admin can delete products"
  ON products FOR DELETE
  USING (is_admin());

-- =============================================
-- CART ITEMS
-- =============================================
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own cart only"
  ON cart_items FOR ALL
  USING (auth.uid() = user_id);

-- =============================================
-- ORDERS
-- =============================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own orders only"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin reads all orders"
  ON orders FOR SELECT
  USING (is_admin());

CREATE POLICY "Admin updates orders"
  ON orders FOR UPDATE
  USING (is_admin());

-- =============================================
-- ORDER ITEMS
-- =============================================
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin reads all order items"
  ON order_items FOR SELECT
  USING (is_admin());

-- =============================================
-- WISHLIST ITEMS
-- =============================================
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own wishlist only"
  ON wishlist_items FOR ALL
  USING (auth.uid() = user_id);


-- migrate:down
