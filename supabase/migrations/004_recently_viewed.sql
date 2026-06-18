-- migrate:up
-- =============================================
-- RECENTLY VIEWED
-- =============================================
CREATE TABLE recently_viewed (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  viewed_at   timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- =============================================
-- RLS
-- =============================================
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own recently viewed only"
  ON recently_viewed FOR ALL
  USING (auth.uid() = user_id);


-- migrate:down
