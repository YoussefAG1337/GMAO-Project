/**
 * @fileoverview Routes d'authentification
 * @description Définit toutes les routes liées à l'authentification de l'API GMAO.
 */

import { Router } from 'express';
import { login, refresh, logout, me, changePassword, signup } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { authLimiter, refreshLimiter } from '../middleware/rateLimiter.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { loginSchema, changePasswordSchema, registerSchema } from '../dtos/auth.dto';

const router = Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Inscription d'un utilisateur (compte inactif par défaut)
 * @access  Public (limité par authLimiter)
 */
router.post('/signup', authLimiter, validateRequest(registerSchema), signup);

/**
 * @route   POST /api/auth/login
 * @desc    Connexion de l'utilisateur
 * @access  Public (limité par authLimiter)
 */
router.post('/login', authLimiter, validateRequest(loginSchema), login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Rafraîchissement du token d'accès
 * @access  Public (nécessite un refresh_token valide en cookie)
 */
router.post('/refresh', refreshLimiter, refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion de l'utilisateur
 * @access  Privé (nécessite un token d'accès valide)
 */
router.post('/logout', authMiddleware, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Récupération du profil de l'utilisateur connecté
 * @access  Privé (nécessite un token d'accès valide)
 */
router.get('/me', authMiddleware, me);

/**
 * @route   POST /api/auth/change-password
 * @desc    Changement du mot de passe
 * @access  Privé (nécessite un token d'accès valide)
 */
router.post(
  '/change-password',
  authMiddleware,
  validateRequest(changePasswordSchema),
  changePassword,
);

export default router;
