/**
 * @fileoverview Routes du Calendrier de Maintenance
 */

import { Router } from 'express';
import { getCalendarData } from '../controllers/calendar.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getCalendarData);

export default router;
