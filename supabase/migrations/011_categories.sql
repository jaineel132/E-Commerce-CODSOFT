-- =============================================
-- CATEGORIES
-- =============================================
CREATE TABLE categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  description text,
  image_url   text,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

INSERT INTO categories (name, slug) VALUES
  ('Electronics', 'electronics'),
  ('Clothing', 'clothing'),
  ('Books', 'books'),
  ('Home & Kitchen', 'home-kitchen');

-- Migrate products
ALTER TABLE products ADD COLUMN category_id uuid REFERENCES categories(id);

UPDATE products SET category_id = c.id
FROM categories c
WHERE LOWER(REPLACE(products.category, ' & ', '-')) = c.slug;

ALTER TABLE products ALTER COLUMN category_id SET NOT NULL;
ALTER TABLE products DROP COLUMN category;

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  USING (true);

-- Update match_products to return category_slug
DROP FUNCTION IF EXISTS public.match_products;
CREATE OR REPLACE FUNCTION public.match_products(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.75,
  match_count int DEFAULT 10
)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  price numeric,
  category_slug text,
  image_url text,
  stock_count int,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    COALESCE(p.description, ''),
    p.price,
    c.slug,
    COALESCE(p.image_url, ''),
    p.stock_count,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  WHERE p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
    AND p.is_active = true
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
