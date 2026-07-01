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
import { validateRequest } from '../middleware/validate.middleware';
import { createDISchema, updateDISchema } from '../dtos/di.dto';

const router = Router();

router.use(authMiddleware);

router.get('/', getDIs);
router.get('/stats', getDIStats);
router.get('/:id', getDIById);

router.post(
  '/',
  rbac([Role.ADMIN, Role.CHEF_MAINTENANCE, Role.CHEF_TECHNICIEN, Role.TECHNICIEN]),
  validateRequest(createDISchema),
  createDI,
);

router.put(
  '/:id',
  rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]),
  validateRequest(updateDISchema),
  updateDI,
);

router.delete('/:id', rbac([Role.ADMIN]), deleteDI);

export default router;
