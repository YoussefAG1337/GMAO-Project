/**
 * @fileoverview Routes de gestion des utilisateurs
 */

import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  getUsers, getUserById, createUser, updateUser, deleteUser, getTechniciens
} from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rbac } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import { createUserSchema, updateUserSchema } from '../validators/user.schema';

const router = Router();

router.use(authMiddleware);

router.get('/techniciens', rbac([Role.ADMIN, Role.CHEF_MAINTENANCE, Role.CHEF_TECHNICIEN]), getTechniciens);

router.get('/', rbac([Role.ADMIN, Role.CHEF_MAINTENANCE, Role.CHEF_TECHNICIEN]), getUsers);
router.get('/:id', rbac([Role.ADMIN]), getUserById);

router.post(
  '/',
  rbac([Role.ADMIN]),
  validate(createUserSchema),
  createUser
);

router.put(
  '/:id',
  rbac([Role.ADMIN]),
  validate(updateUserSchema),
  updateUser
);

router.delete(
  '/:id',
  rbac([Role.ADMIN]),
  deleteUser
);

export default router;
