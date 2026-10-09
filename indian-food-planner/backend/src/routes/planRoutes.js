import { Router } from 'express';
import { get, replace, removeItem } from '../controllers/planController.js';
import { requireAuth } from '../middlewares/auth.js';
const router = Router();
router.use(requireAuth);
router.get('/:date', get);
router.put('/:date', replace);
router.delete('/:date/items/:itemId', removeItem);
export default router;
