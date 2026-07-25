import { Router } from 'express';
import { magasinController } from '../controllers/magasin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

router.get('/pieces', magasinController.getPieces);
router.get('/pieces/:id', magasinController.getPieceById);

router.post(
  '/pieces',
  rbac([Role.ADMIN, Role.CHEF_MAINTENANCE, Role.MAGASINIER]),
  magasinController.createPiece,
);
router.put(
  '/pieces/:id',
  rbac([Role.ADMIN, Role.CHEF_MAINTENANCE, Role.MAGASINIER]),
  magasinController.updatePiece,
);
router.delete(
  '/pieces/:id',
  rbac([Role.ADMIN, Role.CHEF_MAINTENANCE, Role.MAGASINIER]),
  magasinController.deletePiece,
);

router.post(
  '/mouvements',
  rbac([Role.ADMIN, Role.CHEF_MAINTENANCE, Role.MAGASINIER, Role.TECHNICIEN]),
  magasinController.createMouvement,
);

export default router;
