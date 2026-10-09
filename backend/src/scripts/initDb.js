import fs from 'fs/promises';
import { pool } from '../config/db.js';
const sql = await fs.readFile(new URL('../../db/schema.sql', import.meta.url), 'utf8');
await pool.query(sql);
await pool.end();
console.log('Database schema initialized.');
