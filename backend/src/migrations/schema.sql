CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shopping_items (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position INT NOT NULL,
  title VARCHAR(500) NOT NULL,
  product_id VARCHAR(100),
  product_link TEXT,
  source VARCHAR(255),
  source_icon TEXT,
  multiple_sources BOOLEAN DEFAULT FALSE,
  price VARCHAR(50) NOT NULL,
  extracted_price NUMERIC(10, 2) NOT NULL,
  target_price NUMERIC(10, 2),
  last_notified_at TIMESTAMP WITH TIME ZONE,
  rating NUMERIC(3, 2),
  reviews INT,
  snippet TEXT,
  extensions TEXT[], -- Postgres native text array
  thumbnail TEXT,
  delivery VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE shopping_items
  ADD COLUMN IF NOT EXISTS target_price NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS last_notified_at TIMESTAMP WITH TIME ZONE;

CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES shopping_items(id) ON DELETE CASCADE,
  price NUMERIC(10, 2) NOT NULL,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_price_history_item_checked
  ON price_history(item_id, checked_at DESC);

-- Index for fast user-specific lookup performance
CREATE INDEX IF NOT EXISTS idx_items_user_id ON shopping_items(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_product
  ON shopping_items(user_id, product_id)
  WHERE product_id IS NOT NULL;