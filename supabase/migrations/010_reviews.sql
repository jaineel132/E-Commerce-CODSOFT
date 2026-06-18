-- migrate:up
-- =============================================
-- REVIEWS
-- =============================================
CREATE TABLE reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating      int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title       text,
  body        text,
  is_verified_purchase boolean DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- =============================================
-- RLS
-- =============================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);


-- migrate:down
