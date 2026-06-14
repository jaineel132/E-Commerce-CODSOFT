-- Change embedding column from vector(1536) to vector(3072) for Gemini compatibility
ALTER TABLE products
  ALTER COLUMN embedding TYPE vector(3072) USING embedding::vector(3072);

-- Drop and recreate match_products function with vector(3072)
DROP FUNCTION IF EXISTS match_products;

CREATE OR REPLACE FUNCTION match_products(
  query_embedding vector(3072),
  match_threshold float DEFAULT 0.75,
  match_count int DEFAULT 10
)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  price numeric,
  category text,
  image_url text,
  stock_count int,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    products.id,
    products.name,
    products.description,
    products.price,
    products.category,
    products.image_url,
    products.stock_count,
    1 - (products.embedding <=> query_embedding) AS similarity
  FROM products
  WHERE products.is_active = true
    AND products.embedding IS NOT NULL
    AND 1 - (products.embedding <=> query_embedding) > match_threshold
  ORDER BY products.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
