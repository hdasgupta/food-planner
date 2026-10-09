import { Router } from 'express';
import * as controller from '../controllers/menuController.js';
const router=Router(); router.get('/today',controller.todayMenu); router.post('/regenerate',controller.regenerate); router.post('/email',controller.emailToday); export default router;
