import { Router } from 'express';
import { getPannes, createPanne, updatePanne, deletePanne } from '../controllers/panne.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getPannes);
router.post('/', createPanne);
router.put('/:id', updatePanne);
router.delete('/:id', deletePanne);

export default router;
