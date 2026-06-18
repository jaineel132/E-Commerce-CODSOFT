-- migrate:up
-- =============================================
-- ADDRESSES
-- =============================================
CREATE TABLE addresses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label       text NOT NULL DEFAULT 'Home',
  full_name   text NOT NULL,
  street      text NOT NULL,
  city        text NOT NULL,
  state       text NOT NULL,
  zip_code    text NOT NULL,
  country     text NOT NULL DEFAULT 'US',
  phone       text,
  is_default  boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- Ensure only one default per user
CREATE UNIQUE INDEX addresses_single_default_idx
  ON addresses (user_id) WHERE is_default = true;

-- =============================================
-- RLS
-- =============================================
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own addresses only"
  ON addresses FOR ALL
  USING (auth.uid() = user_id);


-- migrate:down
