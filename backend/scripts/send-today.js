import { localDateString } from '../src/services/dateService.js';
import { getTodayMenu, generateMenu } from '../src/services/menuService.js';
import { sendTodayMenu } from '../src/services/emailService.js';
import { pool } from '../src/db/pool.js';

const date = localDateString();
let menu = await getTodayMenu(date);
if (!menu) menu = await generateMenu(date);
console.log(await sendTodayMenu(date));
await pool.end();
