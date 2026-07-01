/**
 * @fileoverview Routes des Ordres de Travail (OT) et Rapports
 */

import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  getOTs,
  getOTById,
  createOT,
  updateOT,
  assignOT,
  startOT,
  submitRapport,
  validateOT,
  deleteOT,
  getOTStats,
} from '../controllers/ot.controller';
import { getRapports, getRapportById, getRapportByOT } from '../controllers/rapport.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  createOTSchema,
  updateOTSchema,
  assignOTSchema,
  submitRapportSchema,
} from '../dtos/ot.dto';

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
  validateRequest(createOTSchema),
  createOT,
);

router.put(
  '/:id',
  rbac([Role.ADMIN, Role.CHEF_TECHNICIEN]),
  validateRequest(updateOTSchema),
  updateOT,
);

router.patch(
  '/:id/assign',
  rbac([Role.ADMIN, Role.CHEF_TECHNICIEN]),
  validateRequest(assignOTSchema),
  assignOT,
);

router.patch('/:id/start', rbac([Role.ADMIN, Role.CHEF_TECHNICIEN, Role.TECHNICIEN]), startOT);

router.post(
  '/:id/rapport',
  rbac([Role.ADMIN, Role.CHEF_TECHNICIEN, Role.TECHNICIEN]),
  validateRequest(submitRapportSchema),
  submitRapport,
);

router.patch('/:id/validate', rbac([Role.ADMIN, Role.CHEF_TECHNICIEN]), validateOT);

router.delete('/:id', rbac([Role.ADMIN]), deleteOT);

export default router;
