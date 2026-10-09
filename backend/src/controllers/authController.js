import { asyncHandler } from '../utils/errors.js';
import { register, login } from '../services/authService.js';
import { findUserById } from '../models/userModel.js';

export const registerController = asyncHandler(async (req,res) => {
  res.status(201).json({ success: true, ...(await register(req.body)) });
});
export const loginController = asyncHandler(async (req,res) => {
  res.json({ success: true, ...(await login(req.body)) });
});
export const meController = asyncHandler(async (req,res) => {
  res.json({ success: true, user: await findUserById(req.user.sub) });
});
