import { listCategories } from '../models/categoryModel.js';

export async function getCategories(req, res, next) {
  try {
    res.json(await listCategories());
  } catch (e) { next(e); }
}
