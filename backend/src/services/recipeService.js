import { listCategories, listRecipes, findRecipe } from '../models/recipeModel.js';

export const getRecipeCategories = () => listCategories();
export const searchRecipeCatalog = filters => listRecipes(filters);
export const getRecipeById = id => findRecipe(id);
