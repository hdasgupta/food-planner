import { asyncHandler } from '../utils/errors.js';
import { getRecipeCategories, searchRecipeCatalog, getRecipeById } from '../services/recipeService.js';

export const categories = asyncHandler(async (req, res) => {
  res.json({ success: true, categories: await getRecipeCategories() });
});

export const recipes = asyncHandler(async (req, res) => {
  res.json({ success: true, recipes: await searchRecipeCatalog(req.query) });
});

export const recipe = asyncHandler(async (req, res) => {
  const item = await getRecipeById(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: 'Recipe not found' });
  res.json({ success: true, recipe: item });
});
