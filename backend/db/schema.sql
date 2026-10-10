CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  timezone VARCHAR(80) NOT NULL DEFAULT 'Asia/Kolkata',
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keep existing installations compatible with newer user preferences.
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone VARCHAR(80) NOT NULL DEFAULT 'Asia/Kolkata';
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  meal_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS recipes (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  region VARCHAR(80) NOT NULL DEFAULT 'Pan-Indian',
  is_vegetarian BOOLEAN NOT NULL DEFAULT TRUE,
  contains_egg BOOLEAN NOT NULL DEFAULT FALSE,
  ingredients TEXT NOT NULL,
  ingredient_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_url TEXT,
  preparation TEXT NOT NULL,
  serving_size VARCHAR(80) DEFAULT '2 servings',
  prep_minutes INT NOT NULL DEFAULT 10,
  cook_minutes INT NOT NULL DEFAULT 20,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(name, category_id)
);

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS ingredient_items JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE TABLE IF NOT EXISTS meal_plans (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, plan_date)
);

CREATE TABLE IF NOT EXISTS meal_plan_items (
  id BIGSERIAL PRIMARY KEY,
  plan_id BIGINT NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  meal_slot VARCHAR(40) NOT NULL CHECK (meal_slot IN ('breakfast','mid_morning','lunch','evening_snack','dinner')),
  recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE RESTRICT,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit VARCHAR(40) NOT NULL DEFAULT 'serving',
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE(plan_id, meal_slot, recipe_id)
);

CREATE TABLE IF NOT EXISTS email_delivery_log (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL,
  delivery_type VARCHAR(40) NOT NULL DEFAULT 'daily_menu',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, plan_date, delivery_type)
);

CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category_id);
CREATE INDEX IF NOT EXISTS idx_plans_user_date ON meal_plans(user_id, plan_date);
CREATE INDEX IF NOT EXISTS idx_plan_items_plan ON meal_plan_items(plan_id);
