import { query } from '../config/db.js';

export async function getMenuByDate(date) {
  const result = await query(`SELECT mp.id, mp.menu_date, mp.generated_at, mp.notes,
    json_agg(json_build_object('id',mi.id,'meal_slot',mi.meal_slot,'category',mi.category,'display_order',mi.display_order,'recipe',json_build_object(
      'id',r.id,'name',r.name,'category',r.category,'cuisine_region',r.cuisine_region,'ingredients',r.ingredients,'preparation',r.preparation,'prep_minutes',r.prep_minutes,'cook_minutes',r.cook_minutes,'servings',r.servings,'contains_egg',r.contains_egg)))
    FILTER (WHERE mi.id IS NOT NULL) AS items
    FROM menu_plans mp LEFT JOIN menu_items mi ON mi.menu_plan_id=mp.id LEFT JOIN recipes r ON r.id=mi.recipe_id
    WHERE mp.menu_date=$1 GROUP BY mp.id`, [date]);
  return result.rows[0] || null;
}

export async function saveMenu(date, items, notes = '') {
  const client = await (await import('../config/db.js')).pool.connect();
  try {
    await client.query('BEGIN');
    const plan = await client.query(`INSERT INTO menu_plans(menu_date,notes) VALUES($1,$2)
      ON CONFLICT(menu_date) DO UPDATE SET generated_at=NOW(), notes=EXCLUDED.notes RETURNING id,menu_date,generated_at,notes`, [date, notes]);
    const planId = plan.rows[0].id;
    await client.query('DELETE FROM menu_items WHERE menu_plan_id=$1', [planId]);
    for (const item of items) {
      await client.query(`INSERT INTO menu_items(menu_plan_id,meal_slot,category,recipe_id,display_order) VALUES($1,$2,$3,$4,$5)`, [planId,item.meal_slot,item.category,item.recipe_id,item.display_order || 0]);
    }
    await client.query('COMMIT');
    return getMenuByDate(date);
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
