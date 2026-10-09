import { query, transaction } from '../config/db.js';

export async function getPlan(userId, date) {
  const { rows } = await query(
    `SELECT p.id,p.plan_date,p.notes,
       COALESCE(json_agg(
         json_build_object(
           'id',i.id,'mealSlot',i.meal_slot,'quantity',i.quantity,'unit',i.unit,
           'sortOrder',i.sort_order,'recipeId',r.id,'recipeName',r.name,
           'category',c.name,'preparation',r.preparation
         ) ORDER BY i.meal_slot,i.sort_order,r.name
       ) FILTER (WHERE i.id IS NOT NULL),'[]') AS items
     FROM meal_plans p
     LEFT JOIN meal_plan_items i ON i.plan_id=p.id
     LEFT JOIN recipes r ON r.id=i.recipe_id
     LEFT JOIN categories c ON c.id=r.category_id
     WHERE p.user_id=$1 AND p.plan_date=$2
     GROUP BY p.id`,
    [userId, date]
  );
  return rows[0] || { id: null, plan_date: date, notes: '', items: [] };
}

export async function replacePlan(userId, date, { notes = '', items = [] }) {
  return transaction(async client => {
    const planResult = await client.query(
      `INSERT INTO meal_plans(user_id,plan_date,notes)
       VALUES($1,$2,$3)
       ON CONFLICT(user_id,plan_date)
       DO UPDATE SET notes=EXCLUDED.notes,updated_at=NOW()
       RETURNING id`,
      [userId, date, notes]
    );
    const planId = planResult.rows[0].id;
    await client.query('DELETE FROM meal_plan_items WHERE plan_id=$1', [planId]);

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      await client.query(
        `INSERT INTO meal_plan_items(plan_id,meal_slot,recipe_id,quantity,unit,sort_order)
         VALUES($1,$2,$3,$4,$5,$6)`,
        [planId, item.mealSlot, Number(item.recipeId), Number(item.quantity || 1), item.unit || 'serving', index]
      );
    }
    return planId;
  });
}

export async function deletePlanItem(userId, itemId) {
  const result = await query(
    `DELETE FROM meal_plan_items i USING meal_plans p
     WHERE i.id=$1 AND i.plan_id=p.id AND p.user_id=$2`,
    [itemId, userId]
  );
  return result.rowCount > 0;
}
