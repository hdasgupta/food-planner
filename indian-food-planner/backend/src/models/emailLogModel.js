import { query } from '../config/db.js';

export async function alreadySent(userId, date, type = 'daily_menu') {
  const { rows } = await query(
    `SELECT 1 FROM email_delivery_log WHERE user_id=$1 AND plan_date=$2 AND delivery_type=$3`,
    [userId, date, type]
  );
  return rows.length > 0;
}

export async function markSent(userId, date, type = 'daily_menu') {
  await query(
    `INSERT INTO email_delivery_log(user_id,plan_date,delivery_type)
     VALUES($1,$2,$3) ON CONFLICT DO NOTHING`,
    [userId, date, type]
  );
}
