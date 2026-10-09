import { readFile } from 'node:fs/promises';
import { pool } from '../config/db.js';

// The curated master catalog is kept as data so it can be reviewed and extended
// independently from the database seeding logic.
const seedData = JSON.parse(await readFile(new URL('../data/indian-recipes.json', import.meta.url), 'utf8'));
const { categories, recipes } = seedData;

// Support deployed databases where recipe detail columns are JSON/JSONB, as well
// as fresh installations where those columns are TEXT.
const recipeColumnTypesResult = await pool.query(`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_schema = current_schema() AND table_name = 'recipes'
    AND column_name IN ('ingredients', 'preparation')
`);
const recipeColumnTypes = Object.fromEntries(
  recipeColumnTypesResult.rows.map(row => [row.column_name, row.data_type])
);
const isJsonColumn = column => ['json', 'jsonb'].includes(recipeColumnTypes[column]);
const serializeRecipeField = (column, value) => {
  if (!isJsonColumn(column)) return value;
  if (column === 'ingredients') {
    const items = Array.isArray(value) ? value : String(value ?? '').split(',').map(item => item.trim()).filter(Boolean);
    return JSON.stringify(items);
  }
  return JSON.stringify(value ?? '');
};

// Backward-compatible schema upgrade for databases created by an earlier version.
// Do not drop or recreate the table because existing category references may already exist.
await pool.query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS meal_order INT NOT NULL DEFAULT 0`);

// Add recipe fields individually so existing recipe/category data is preserved.
await pool.query(`
  ALTER TABLE recipes
    ADD COLUMN IF NOT EXISTS region VARCHAR(100),
    ADD COLUMN IF NOT EXISTS is_vegetarian BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS contains_egg BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS ingredients TEXT,
    ADD COLUMN IF NOT EXISTS preparation TEXT,
    ADD COLUMN IF NOT EXISTS serving_size VARCHAR(100),
    ADD COLUMN IF NOT EXISTS prep_minutes INT,
    ADD COLUMN IF NOT EXISTS cook_minutes INT,
    ADD COLUMN IF NOT EXISTS notes TEXT
`);

for (const category of categories) {
  await pool.query(
    `INSERT INTO categories(name,meal_order) VALUES($1,$2)
     ON CONFLICT(name) DO UPDATE SET meal_order=EXCLUDED.meal_order`,
    [category.name, category.meal_order]
  );
}

for (const recipe of recipes) {
  const cat = await pool.query('SELECT id FROM categories WHERE name=$1', [recipe.category]);
  if (!cat.rows[0]) throw new Error(`Missing recipe category: ${recipe.category}`);

  await pool.query(
    `INSERT INTO recipes
      (name,category_id,region,is_vegetarian,contains_egg,ingredients,preparation,
       serving_size,prep_minutes,cook_minutes,notes)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT(name,category_id) DO UPDATE SET
       region=EXCLUDED.region,is_vegetarian=EXCLUDED.is_vegetarian,contains_egg=EXCLUDED.contains_egg,
       ingredients=EXCLUDED.ingredients,preparation=EXCLUDED.preparation,
       serving_size=EXCLUDED.serving_size,prep_minutes=EXCLUDED.prep_minutes,
       cook_minutes=EXCLUDED.cook_minutes,notes=EXCLUDED.notes`,
    [recipe.name, cat.rows[0].id, recipe.region, !recipe.contains_egg, recipe.contains_egg,
      serializeRecipeField('ingredients', recipe.ingredients),
      serializeRecipeField('preparation', recipe.preparation), recipe.serving_size || '2 servings',
      recipe.prep_minutes, recipe.cook_minutes, recipe.notes || '']
  );
}

await pool.end();
console.log(`Seeded ${recipes.length} homemade Indian recipes across ${categories.length} categories.`);
