/**
 * @fileoverview Routes des Plans de Maintenance
 */

import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  triggerPlan,
} from '../controllers/plan.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createPlanSchema, updatePlanSchema } from '../dtos/plan.dto';

const router = Router();

router.use(authMiddleware);

router.get('/', getPlans);
router.get('/:id', getPlanById);

router.post(
  '/',
  rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]),
  validateRequest(createPlanSchema),
  createPlan,
);

router.put(
  '/:id',
  rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]),
  validateRequest(updatePlanSchema),
  updatePlan,
);

router.post('/:id/trigger', rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]), triggerPlan);

router.delete('/:id', rbac([Role.ADMIN]), deletePlan);

export default router;
