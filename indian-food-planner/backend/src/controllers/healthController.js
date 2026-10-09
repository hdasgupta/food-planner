import { query } from '../config/db.js';

export async function health(req,res) {
  res.json({status:'ok',service:'indian-food-planner-api',time:new Date().toISOString()});
}
export async function ready(req,res) {
  try {
    await query('SELECT 1');
    res.json({status:'ready',database:'ok'});
  } catch {
    res.status(503).json({status:'not_ready',database:'unavailable'});
  }
}
