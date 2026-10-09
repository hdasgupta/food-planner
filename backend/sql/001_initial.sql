CREATE TABLE IF NOT EXISTS recipes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  cuisine_region TEXT NOT NULL DEFAULT 'Pan-Indian',
  meal_tags TEXT[] NOT NULL DEFAULT '{}',
  is_vegetarian BOOLEAN NOT NULL DEFAULT TRUE,
  contains_egg BOOLEAN NOT NULL DEFAULT FALSE,
  ingredients JSONB NOT NULL DEFAULT '[]',
  preparation TEXT[] NOT NULL DEFAULT '{}',
  prep_minutes INTEGER NOT NULL DEFAULT 15,
  cook_minutes INTEGER NOT NULL DEFAULT 20,
  servings INTEGER NOT NULL DEFAULT 2,
  source TEXT NOT NULL DEFAULT 'curated-in-app',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_active ON recipes(active);
CREATE INDEX IF NOT EXISTS idx_recipes_meal_tags ON recipes USING GIN(meal_tags);

CREATE TABLE IF NOT EXISTS menu_plans (
  id BIGSERIAL PRIMARY KEY,
  menu_date DATE NOT NULL UNIQUE,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS menu_items (
  id BIGSERIAL PRIMARY KEY,
  menu_plan_id BIGINT NOT NULL REFERENCES menu_plans(id) ON DELETE CASCADE,
  meal_slot TEXT NOT NULL,
  category TEXT NOT NULL,
  recipe_id BIGINT NOT NULL REFERENCES recipes(id),
  display_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(menu_plan_id, meal_slot, category, recipe_id)
);
CREATE INDEX IF NOT EXISTS idx_menu_items_plan ON menu_items(menu_plan_id);

CREATE TABLE IF NOT EXISTS email_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  recipient_email TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_delivery_log (
  id BIGSERIAL PRIMARY KEY,
  menu_date DATE NOT NULL,
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL,
  message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
