/**
 * @fileoverview Routes des Ordres de Travail (OT) et Rapports
 */

import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  getOTs, getOTById, createOT, updateOT, assignOT, startOT, submitRapport, validateOT, deleteOT, getOTStats
} from '../controllers/ot.controller';
import {
  getRapports, getRapportById, getRapportByOT
} from '../controllers/rapport.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import { createOTSchema, updateOTSchema, assignOTSchema, validateOTSchema } from '../validators/ot.schema';
import { createRapportSchema } from '../validators/rapport.schema';

const router = Router();

router.use(authMiddleware);

// ==========================================
// RAPPORTS
// ==========================================
router.get('/rapports', getRapports);
router.get('/rapports/:id', getRapportById);

// ==========================================
// ORDRES DE TRAVAIL
// ==========================================
router.get('/', getOTs);
router.get('/stats', getOTStats);
router.get('/:id', getOTById);
router.get('/:otId/rapport', getRapportByOT);

router.post(
  '/',
  rbac([Role.ADMIN, Role.CHEF_TECHNICIEN]),
  validate(createOTSchema),
  createOT
);

router.put(
  '/:id',
  rbac([Role.ADMIN, Role.CHEF_TECHNICIEN]),
  validate(updateOTSchema),
  updateOT
);

router.patch(
  '/:id/assign',
  rbac([Role.ADMIN, Role.CHEF_TECHNICIEN]),
  validate(assignOTSchema),
  assignOT
);

router.patch(
  '/:id/start',
  rbac([Role.ADMIN, Role.CHEF_TECHNICIEN, Role.TECHNICIEN]),
  startOT
);

router.post(
  '/:id/rapport',
  rbac([Role.ADMIN, Role.CHEF_TECHNICIEN, Role.TECHNICIEN]),
  validate(createRapportSchema),
  submitRapport
);

router.patch(
  '/:id/validate',
  rbac([Role.ADMIN, Role.CHEF_TECHNICIEN]),
  validateOT
);

router.delete(
  '/:id',
  rbac([Role.ADMIN]),
  deleteOT
);

export default router;
