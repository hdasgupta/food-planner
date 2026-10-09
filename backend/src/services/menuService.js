import { query } from '../config/db.js';
import { getMenuByDate, saveMenu } from '../models/menuModel.js';

const planRules = [
  ['breakfast','drink',1], ['breakfast','breakfast',1], ['breakfast','side',1],
  ['morning','drink',1],
  ['lunch','dal',1], ['lunch','rice',1], ['lunch','bread',1], ['lunch','main',1], ['lunch','side',1], ['lunch','raita',1],
  ['evening','drink',1], ['evening','snack',1],
  ['dinner','dal',1], ['dinner','rice',1], ['dinner','bread',1], ['dinner','main',1], ['dinner','side',1], ['dinner','dessert',1]
];

function dayNumber(date) { return Math.floor(new Date(`${date}T00:00:00Z`).getTime()/86400000); }

async function pick(category, offset, date) {
  const count = await query('SELECT COUNT(*)::int AS count FROM recipes WHERE active=TRUE AND category=$1 AND $2 = ANY(meal_tags)', [category, offset]);
  let rows;
  if (count.rows[0].count) rows = await query(`SELECT id,name FROM recipes WHERE active=TRUE AND category=$1 AND $2=ANY(meal_tags) ORDER BY id`, [category, offset]);
  else rows = await query(`SELECT id,name FROM recipes WHERE active=TRUE AND category=$1 ORDER BY id`, [category]);
  if (!rows.rows.length) throw new Error(`No active recipes for category: ${category}`);
  return rows.rows[dayNumber(date) % rows.rows.length];
}

export async function generateMenu(date) {
  const items = [];
  const used = new Set();
  let index = 0;
  for (const [meal_slot, category] of planRules) {
    let chosen = await pick(category, meal_slot, date);
    if (used.has(chosen.id)) {
      const alternatives = await query('SELECT id,name FROM recipes WHERE active=TRUE AND category=$1 AND id <> ALL($2::bigint[]) ORDER BY id LIMIT 20', [category, [...used]]);
      if (alternatives.rows.length) chosen = alternatives.rows[(dayNumber(date)+index) % alternatives.rows.length];
    }
    used.add(chosen.id);
    items.push({ meal_slot, category, recipe_id: chosen.id, display_order: index++ });
  }
  return saveMenu(date, items, 'Automatically generated daily Indian homemade menu.');
}

export async function getOrGenerateMenu(date) { return (await getMenuByDate(date)) || generateMenu(date); }
