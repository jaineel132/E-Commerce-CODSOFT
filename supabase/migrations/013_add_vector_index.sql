-- migrate:up
-- Gemini embedding models output 3072-dimensional vectors
-- pgvector IVFFlat/HNSW indexes cap at 2000 dims, so no index is possible
-- at this dimensionality. Index should be added when a 768-dim model is used.

-- Drop then re-add embedding column as vector(3072) to match actual Gemini output
ALTER TABLE products DROP COLUMN IF EXISTS embedding;
ALTER TABLE products ADD COLUMN embedding vector(3072);

-- Recreate match_products with correct dimension and schema
-- Must LEFT JOIN categories (products.category column was dropped in migration 011)
DROP FUNCTION IF EXISTS match_products;

CREATE OR REPLACE FUNCTION match_products(
  query_embedding vector(3072),
  match_threshold float DEFAULT 0.5,
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
  WHERE p.is_active = true
    AND p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- NOTE: Once pgvector supports >2000-dim HNSW on this Supabase project,
-- or if you switch to a 768-dim model, add:
-- CREATE INDEX products_embedding_idx ON products USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);


-- migrate:down
