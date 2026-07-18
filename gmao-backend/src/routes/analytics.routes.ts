import { Router } from 'express';
import { Role } from '@prisma/client';
import { getDashboardAnalytics, getWorkrates } from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';

const router = Router();

// Protect routes
router.use(authMiddleware);

// Only ADMIN and CHEF_MAINTENANCE can access the global analytics dashboard
router.get('/', rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]), getDashboardAnalytics);
router.get('/workrates', rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]), getWorkrates);

export default router;
