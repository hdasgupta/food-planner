import { query } from '../config/db.js';

export async function listCategories() {
  const { rows } = await query(
    'SELECT id,name,meal_order FROM categories ORDER BY meal_order,name'
  );
  return rows;
}

// Return the complete catalog by default. Egg recipes are part of the master
// catalog and should not silently disappear from search or menu planning.
export async function listRecipes({ search = '', categoryId = '', vegetarian = 'all', limit = 300, offset = 0 } = {}) {
  const params = [];
  const conditions = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(r.name ILIKE $${params.length} OR r.ingredients ILIKE $${params.length})`);
  }
  if (categoryId) {
    params.push(Number(categoryId));
    conditions.push(`r.category_id=$${params.length}`);
  }
  if (vegetarian === 'true') {
    conditions.push('r.is_vegetarian=true');
  } else if (vegetarian === 'false') {
    conditions.push('r.is_vegetarian=false');
  }

  params.push(Math.min(Math.max(Number(limit) || 300, 1), 500));
  const limitIndex = params.length;
  params.push(Math.max(Number(offset) || 0, 0));
  const offsetIndex = params.length;

  const { rows } = await query(
    `SELECT r.*, c.name AS category_name,
            COALESCE(recipe_usage.usage_count, 0) AS usage_count
     FROM recipes r
     JOIN categories c ON c.id=r.category_id
     LEFT JOIN (
       SELECT recipe_id, COUNT(*) AS usage_count
       FROM meal_plan_items
       GROUP BY recipe_id
     ) recipe_usage ON recipe_usage.recipe_id=r.id
     ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
     ORDER BY COALESCE(recipe_usage.usage_count, 0) DESC, r.name ASC
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    params
  );
  return rows;
}

export async function findRecipe(id) {
  const { rows } = await query(
    `SELECT r.*, c.name AS category_name FROM recipes r
     JOIN categories c ON c.id=r.category_id WHERE r.id=$1`,
    [id]
  );
  return rows[0];
}
