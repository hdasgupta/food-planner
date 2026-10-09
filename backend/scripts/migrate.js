import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/db/pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sql = await fs.readFile(path.join(__dirname, '../sql/001_initial.sql'), 'utf8');
await pool.query(sql);
console.log('Database migration complete.');
await pool.end();
