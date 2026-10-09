import { env } from '../config/env.js';
import { pool } from '../config/db.js';
import { getOrGenerateMenu } from '../services/menuService.js';
import { sendMenuEmail } from '../services/emailService.js';
const date = new Intl.DateTimeFormat('en-CA',{timeZone:env.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const menu=await getOrGenerateMenu(date);
const info=await sendMenuEmail(menu);
console.log(`Daily menu sent for ${date}: ${info.messageId}`);
await pool.end();
