import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/db/pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(await fs.readFile(path.join(__dirname, '../data/indian-recipes.json'), 'utf8'));

const categoryNames = [...new Set(data.map(r => r.category))];

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

await pool.query('BEGIN');
try {
  for (const name of categoryNames) {
    const slug = slugify(name);
    await pool.query(`
      INSERT INTO categories(name, slug) VALUES($1,$2)
      ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name
    `, [name, slug]);
  }

  for (const recipe of data) {
    await pool.query(`
      INSERT INTO recipes
        (name, slug, category_id, meal_types, is_egg, prep_minutes, cook_minutes, servings, ingredients, instructions, tags, source)
      VALUES
        ($1, $2, (SELECT id FROM categories WHERE slug=$3), $4, $5, $6, $7, $8, $9::jsonb, $10, $11, 'bundled-seed')
      ON CONFLICT(slug) DO UPDATE SET
        name=EXCLUDED.name,
        category_id=EXCLUDED.category_id,
        meal_types=EXCLUDED.meal_types,
        is_egg=EXCLUDED.is_egg,
        prep_minutes=EXCLUDED.prep_minutes,
        cook_minutes=EXCLUDED.cook_minutes,
        servings=EXCLUDED.servings,
        ingredients=EXCLUDED.ingredients,
        instructions=EXCLUDED.instructions,
        tags=EXCLUDED.tags,
        updated_at=NOW()
    `, [
      recipe.name, recipe.slug, slugify(recipe.category), recipe.mealTypes, !!recipe.isEgg,
      recipe.prepMinutes, recipe.cookMinutes, recipe.servings,
      JSON.stringify(recipe.ingredients), recipe.instructions, recipe.tags || []
    ]);
  }
  await pool.query('COMMIT');
  console.log(`Seeded ${data.length} recipes across ${categoryNames.length} categories.`);
} catch (e) {
  await pool.query('ROLLBACK');
  throw e;
} finally {
  await pool.end();
}
