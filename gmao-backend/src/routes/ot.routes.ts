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
  validerTechnicien,
  validateOT,
  reporterOT,
  annulerOT,
  nonValiderOT,
  deleteOT,
  getOTStats,
  startFromDi,
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
  reporterOTSchema,
  annulerOTSchema,
  nonValideOTSchema,
  getOTsSchema,
} from '../dtos/ot.dto';
import { paginationOnlySchema } from '../dtos/pagination.dto';

const router = Router();

router.use(authMiddleware);

router.get('/rapports', validateRequest(paginationOnlySchema), getRapports);
router.get('/rapports/:id', getRapportById);

router.get('/', validateRequest(getOTsSchema), getOTs);
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
  '/start-from-di/:diId',
  rbac([Role.ADMIN, Role.CHEF_TECHNICIEN, Role.TECHNICIEN]),
  startFromDi,
);

router.post(
  '/:id/rapport',
  rbac([Role.ADMIN, Role.CHEF_TECHNICIEN, Role.TECHNICIEN]),
  validateRequest(submitRapportSchema),
  submitRapport,
);

router.patch(
  '/:id/valider-technicien',
  rbac([Role.ADMIN, Role.CHEF_TECHNICIEN, Role.TECHNICIEN]),
  validerTechnicien,
);

router.patch('/:id/validate', rbac([Role.ADMIN, Role.CHEF_TECHNICIEN]), validateOT);

router.patch(
  '/:id/reporter',
  rbac([Role.ADMIN, Role.CHEF_TECHNICIEN, Role.TECHNICIEN]),
  validateRequest(reporterOTSchema),
  reporterOT,
);

router.patch(
  '/:id/annuler',
  rbac([Role.ADMIN, Role.CHEF_TECHNICIEN, Role.TECHNICIEN]),
  validateRequest(annulerOTSchema),
  annulerOT,
);

router.patch(
  '/:id/non-valide',
  rbac([Role.ADMIN, Role.CHEF_TECHNICIEN, Role.TECHNICIEN]),
  validateRequest(nonValideOTSchema),
  nonValiderOT,
);

router.delete('/:id', rbac([Role.ADMIN]), deleteOT);

export default router;
