import { Router } from 'express';
import { Role } from '@prisma/client';
import { getDashboardAnalytics, getWorkrates } from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]), getDashboardAnalytics);
router.get('/workrates', rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]), getWorkrates);

export default router;
