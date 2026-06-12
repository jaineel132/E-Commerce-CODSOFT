-- Seed products (embeddings will be generated in Phase 6)
INSERT INTO products (name, description, price, category, image_url, stock_count) VALUES
-- Electronics
(
  'Wireless Noise-Cancelling Headphones',
  'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and Bluetooth 5.2.',
  249.99,
  'Electronics',
  NULL,
  15
),
(
  'USB-C Hub 7-in-1',
  'Compact multiport adapter with HDMI 4K, USB 3.0, SD card reader, and 100W PD charging.',
  39.99,
  'Electronics',
  NULL,
  42
),
(
  'Mechanical Keyboard',
  'Hot-swappable RGB mechanical keyboard with Cherry MX switches and aluminium frame.',
  129.99,
  'Electronics',
  NULL,
  8
),
-- Clothing
(
  'Merino Wool Winter Jacket',
  'Warm and breathable winter jacket made from 100% merino wool with water-resistant finish.',
  189.99,
  'Clothing',
  NULL,
  3
),
(
  'Slim Fit Chinos',
  'Classic slim-fit chino pants in stretch cotton twill. Available in khaki, navy, and olive.',
  59.99,
  'Clothing',
  NULL,
  25
),
(
  'Running Shoes',
  'Lightweight performance running shoes with responsive cushioning and breathable mesh upper.',
  119.99,
  'Clothing',
  NULL,
  12
),
-- Books
(
  'The Pragmatic Programmer',
  '20th Anniversary Edition. Timeless tips for software engineers by Andrew Hunt and David Thomas.',
  49.99,
  'Books',
  NULL,
  20
),
(
  'Atomic Habits',
  'An Easy and Proven Way to Build Good Habits and Break Bad Ones by James Clear.',
  24.99,
  'Books',
  NULL,
  35
),
(
  'Designing Data-Intensive Applications',
  'The big ideas behind reliable, scalable, and maintainable systems by Martin Kleppmann.',
  44.99,
  'Books',
  NULL,
  10
),
-- Home & Kitchen
(
  'Cast Iron Skillet',
  'Pre-seasoned 12-inch cast iron skillet with even heat distribution for searing, baking, and frying.',
  49.99,
  'Home & Kitchen',
  NULL,
  18
),
(
  'French Press Coffee Maker',
  'Stainless steel 34oz French press with 4-level filtration system, keeps coffee hot for 60 minutes.',
  34.99,
  'Home & Kitchen',
  NULL,
  22
),
(
  'Scented Soy Candle Set',
  'Set of 3 hand-poured soy candles. Scents: Vanilla Lavender, Cedar Pine, Fresh Linen. 50hr burn each.',
  29.99,
  'Home & Kitchen',
  NULL,
  30
);
