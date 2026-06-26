/**
 * @fileoverview Routes du Tableau de Bord et des KPIs
 */

import { Router } from 'express';
import { Role } from '@prisma/client';
import { getDashboardStats, getKPIs } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/stats', getDashboardStats);
router.get('/kpis', rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]), getKPIs);

export default router;
