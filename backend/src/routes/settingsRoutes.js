import { Router } from 'express';
import * as controller from '../controllers/settingsController.js';
const router=Router(); router.get('/email',controller.get); router.put('/email',controller.save); export default router;
