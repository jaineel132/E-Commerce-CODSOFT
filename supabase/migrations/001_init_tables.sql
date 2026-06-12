-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES
-- =============================================
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  full_name   text,
  avatar_url  text,
  role        text DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at  timestamptz DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- PRODUCTS
-- =============================================
CREATE TABLE products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  description   text,
  price         numeric NOT NULL CHECK (price >= 0),
  category      text NOT NULL,
  image_url     text,
  stock_count   int DEFAULT 0 CHECK (stock_count >= 0),
  is_active     boolean DEFAULT true,
  embedding     vector(1536),
  created_at    timestamptz DEFAULT now()
);

-- =============================================
-- CART ITEMS
-- =============================================
CREATE TABLE cart_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    int DEFAULT 1 CHECK (quantity > 0),
  created_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- =============================================
-- ORDERS
-- =============================================
CREATE TABLE orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id),
  stripe_session  text NOT NULL,
  total_amount    numeric NOT NULL CHECK (total_amount >= 0),
  status          text DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered')),
  created_at      timestamptz DEFAULT now()
);

-- =============================================
-- ORDER ITEMS
-- =============================================
CREATE TABLE order_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES products(id),
  quantity    int NOT NULL CHECK (quantity > 0),
  unit_price  numeric NOT NULL CHECK (unit_price >= 0)
);

-- =============================================
-- WISHLIST ITEMS
-- =============================================
CREATE TABLE wishlist_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);
