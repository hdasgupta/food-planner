import { asyncHandler } from '../utils/errors.js';
import { getPlan, replacePlan, deletePlanItem } from '../models/planModel.js';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const get = asyncHandler(async (req,res) => {
  if (!dateRegex.test(req.params.date)) return res.status(400).json({success:false,error:'Invalid date'});
  res.json({success:true,plan:await getPlan(req.user.sub,req.params.date)});
});

export const replace = asyncHandler(async (req,res) => {
  const { date } = req.params;
  if (!dateRegex.test(date)) return res.status(400).json({success:false,error:'Invalid date'});
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const allowed = ['breakfast','mid_morning','lunch','evening_snack','dinner'];
  if (items.some(i => !allowed.includes(i.mealSlot) || !i.recipeId)) {
    return res.status(400).json({success:false,error:'Invalid plan item'});
  }
  await replacePlan(req.user.sub,date,{notes:req.body.notes || '',items});
  res.json({success:true,plan:await getPlan(req.user.sub,date)});
});

export const removeItem = asyncHandler(async (req,res) => {
  const deleted = await deletePlanItem(req.user.sub, req.params.itemId);
  if (!deleted) return res.status(404).json({success:false,error:'Plan item not found'});
  res.json({success:true});
});
