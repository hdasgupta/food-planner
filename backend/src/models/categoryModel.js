import { query } from '../db/pool.js';

export async function listCategories() {
  const { rows } = await query('SELECT * FROM categories ORDER BY name');
  return rows;
}
