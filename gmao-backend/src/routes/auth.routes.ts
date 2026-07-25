import { Router } from 'express';
import { login, refresh, logout, me, changePassword, signup } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { authLimiter, refreshLimiter } from '../middleware/rateLimiter.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { loginSchema, changePasswordSchema, registerSchema } from '../dtos/auth.dto';

const router = Router();

router.post('/signup', authLimiter, validateRequest(registerSchema), signup);

router.post('/login', authLimiter, validateRequest(loginSchema), login);

router.post('/refresh', refreshLimiter, refresh);

router.post('/logout', authMiddleware, logout);

router.get('/me', authMiddleware, me);

router.post(
  '/change-password',
  authMiddleware,
  validateRequest(changePasswordSchema),
  changePassword,
);

export default router;
