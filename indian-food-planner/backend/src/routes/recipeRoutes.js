import { Router } from 'express';
import { categories, recipes, recipe } from '../controllers/recipeController.js';
const router = Router();
router.get('/categories', categories);
router.get('/', recipes);
router.get('/:id', recipe);
export default router;
