import { getPlan, replacePlan, deletePlanItem } from '../models/planModel.js';

export const getUserPlanForDate = (userId, date) => getPlan(userId, date);
export const saveUserPlanForDate = (userId, date, plan) => replacePlan(userId, date, plan);
export const removeUserPlanItem = (userId, itemId) => deletePlanItem(userId, itemId);
