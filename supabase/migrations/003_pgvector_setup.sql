-- Enable pgvector extension (must also be enabled in Dashboard → Database → Extensions)
CREATE EXTENSION IF NOT EXISTS vector;

-- The embedding column was already created in 001_init_tables.sql
-- but we ensure it exists with the right dimensions
ALTER TABLE products
  ALTER COLUMN embedding TYPE vector(1536) USING embedding::vector(1536);

-- Create the match_products function for semantic similarity search
-- Uses cosine distance (<=>) with a minimum threshold
CREATE OR REPLACE FUNCTION match_products(
  query_embedding vector(1536),
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
