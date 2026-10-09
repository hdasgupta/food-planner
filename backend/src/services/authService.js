import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail } from '../models/userModel.js';
import { signToken } from '../utils/auth.js';
import { AppError } from '../utils/errors.js';

export async function register({ name, email, password }) {
  if (!name || !email || !password || password.length < 8) {
    throw new AppError('Name, valid email and password of at least 8 characters are required');
  }
  const normalized = email.trim().toLowerCase();
  if (await findUserByEmail(normalized)) throw new AppError('Email is already registered', 409);
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser({ name: name.trim(), email: normalized, passwordHash });
  return { user, token: signToken(user) };
}

export async function login({ email, password }) {
  const user = await findUserByEmail(email.trim().toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new AppError('Invalid email or password', 401);
  }
  return {
    user: { id: user.id, name: user.name, email: user.email, timezone: user.timezone, email_enabled: user.email_enabled },
    token: signToken(user)
  };
}
