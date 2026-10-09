import { asyncHandler } from '../utils/errors.js';
import { listCategories, listRecipes, findRecipe } from '../models/recipeModel.js';

export const categories = asyncHandler(async (req,res) => res.json({success:true,categories:await listCategories()}));
export const recipes = asyncHandler(async (req,res) => res.json({success:true,recipes:await listRecipes(req.query)}));
export const recipe = asyncHandler(async (req,res) => {
  const item = await findRecipe(req.params.id);
  if (!item) return res.status(404).json({success:false,error:'Recipe not found'});
  res.json({success:true,recipe:item});
});
