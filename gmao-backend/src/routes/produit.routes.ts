import { Router } from 'express';
import { produitController } from '../controllers/produit.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

router.get('/familles', produitController.getFamilles);
router.get('/familles/:id', produitController.getFamilleById);

router.post(
  '/familles',
  rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]),
  produitController.createFamille,
);
router.put(
  '/familles/:id',
  rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]),
  produitController.updateFamille,
);
router.delete(
  '/familles/:id',
  rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]),
  produitController.deleteFamille,
);

router.get('/', produitController.getProduits);
router.get('/:id', produitController.getProduitById);

router.post('/', rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]), produitController.createProduit);
router.put('/:id', rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]), produitController.updateProduit);
router.delete('/:id', rbac([Role.ADMIN, Role.CHEF_MAINTENANCE]), produitController.deleteProduit);

export default router;
