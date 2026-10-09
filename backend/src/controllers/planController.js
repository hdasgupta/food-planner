import { asyncHandler } from '../utils/errors.js';
import { getUserPlanForDate, saveUserPlanForDate, removeUserPlanItem } from '../services/planService.js';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const allowedMealSlots = ['breakfast', 'mid_morning', 'lunch', 'evening_snack', 'dinner'];

export const get = asyncHandler(async (req, res) => {
  if (!dateRegex.test(req.params.date)) return res.status(400).json({ success: false, error: 'Invalid date' });
  res.json({ success: true, plan: await getUserPlanForDate(req.user.sub, req.params.date) });
});

export const replace = asyncHandler(async (req, res) => {
  const { date } = req.params;
  if (!dateRegex.test(date)) return res.status(400).json({ success: false, error: 'Invalid date' });
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  if (items.some(item => !allowedMealSlots.includes(item.mealSlot) || !item.recipeId)) {
    return res.status(400).json({ success: false, error: 'Invalid plan item' });
  }
  await saveUserPlanForDate(req.user.sub, date, { notes: req.body.notes || '', items });
  res.json({ success: true, plan: await getUserPlanForDate(req.user.sub, date) });
});

export const removeItem = asyncHandler(async (req, res) => {
  const deleted = await removeUserPlanItem(req.user.sub, req.params.itemId);
  if (!deleted) return res.status(404).json({ success: false, error: 'Plan item not found' });
  res.json({ success: true });
});
