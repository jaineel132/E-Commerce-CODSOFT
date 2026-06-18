-- migrate:up
-- Allow admins to read all profiles (needed for order management to show customer info)
CREATE POLICY "Admin reads all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- Allow admins to read all addresses (needed to see shipping addresses on orders)
CREATE POLICY "Admin reads all addresses"
  ON addresses FOR SELECT
  USING (is_admin());


-- migrate:down
