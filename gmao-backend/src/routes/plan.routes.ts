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
} from '../controllers/plan.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import { createPlanSchema, updatePlanSchema } from '../validators/plan.schema';

const router = Router();

router.use(authMiddleware);

router.get('/', getPlans);
router.get('/:id', getPlanById);

router.post('/', rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]), validate(createPlanSchema), createPlan);

router.put(
  '/:id',
  rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]),
  validate(updatePlanSchema),
  updatePlan,
);

router.delete('/:id', rbac([Role.ADMIN]), deletePlan);

export default router;
