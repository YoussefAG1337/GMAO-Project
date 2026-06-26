/**
 * @fileoverview Routes des équipements
 * @description Routes pour les Ateliers, Lignes et Postes
 */

import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  getAteliers,
  getAtelierById,
  createAtelier,
  updateAtelier,
  deleteAtelier,
  getLignes,
  getLigneById,
  createLigne,
  updateLigne,
  deleteLigne,
  getPostes,
  getPosteById,
  createPoste,
  updatePoste,
  deletePoste,
} from '../controllers/equipement.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createAtelierSchema,
  updateAtelierSchema,
  createLigneSchema,
  updateLigneSchema,
  createPosteSchema,
  updatePosteSchema,
} from '../validators/equipement.schema';

const router = Router();

// Toutes les routes nécessitent d'être authentifié
router.use(authMiddleware);

// ==========================================
// ATELIERS
// ==========================================

router.get('/ateliers', getAteliers);
router.get('/ateliers/:id', getAtelierById);

router.post(
  '/ateliers',
  rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]),
  validate(createAtelierSchema),
  createAtelier,
);

router.put(
  '/ateliers/:id',
  rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]),
  validate(updateAtelierSchema),
  updateAtelier,
);

router.delete('/ateliers/:id', rbac([Role.ADMIN]), deleteAtelier);

// ==========================================
// LIGNES
// ==========================================

router.get('/lignes', getLignes);
router.get('/lignes/:id', getLigneById);

router.post(
  '/lignes',
  rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]),
  validate(createLigneSchema),
  createLigne,
);

router.put(
  '/lignes/:id',
  rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]),
  validate(updateLigneSchema),
  updateLigne,
);

router.delete('/lignes/:id', rbac([Role.ADMIN]), deleteLigne);

// ==========================================
// POSTES
// ==========================================

router.get('/postes', getPostes);
router.get('/postes/:id', getPosteById);

router.post(
  '/postes',
  rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]),
  validate(createPosteSchema),
  createPoste,
);

router.put(
  '/postes/:id',
  rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]),
  validate(updatePosteSchema),
  updatePoste,
);

router.delete('/postes/:id', rbac([Role.ADMIN]), deletePoste);

export default router;
