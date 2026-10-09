import { query } from '../config/db.js';
export async function getEmailSettings() {
  const result = await query('SELECT * FROM email_settings WHERE id=1');
  return result.rows[0] || null;
}
export async function upsertEmailSettings(recipient_email, enabled = true) {
  const result = await query(`INSERT INTO email_settings(id,recipient_email,enabled) VALUES(1,$1,$2)
    ON CONFLICT(id) DO UPDATE SET recipient_email=EXCLUDED.recipient_email,enabled=EXCLUDED.enabled,updated_at=NOW() RETURNING *`, [recipient_email, enabled]);
  return result.rows[0];
}
