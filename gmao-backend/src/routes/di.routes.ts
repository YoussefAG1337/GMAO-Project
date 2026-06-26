/**
 * @fileoverview Routes des Demandes d'Intervention (DI)
 */

import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  getDIs,
  getDIById,
  createDI,
  updateDI,
  deleteDI,
  getDIStats,
} from '../controllers/di.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import { createDISchema, updateDISchema } from '../validators/di.schema';

const router = Router();

router.use(authMiddleware);

router.get('/', getDIs);
router.get('/stats', getDIStats);
router.get('/:id', getDIById);

router.post(
  '/',
  rbac([Role.ADMIN, Role.CHEF_MAINTENANCE, Role.CHEF_TECHNICIEN, Role.TECHNICIEN]),
  validate(createDISchema),
  createDI,
);

router.put('/:id', rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]), validate(updateDISchema), updateDI);

router.delete('/:id', rbac([Role.ADMIN]), deleteDI);

export default router;
