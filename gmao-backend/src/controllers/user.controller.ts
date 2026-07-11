import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { userService } from '../services/user.service';
import { UnauthorizedError } from '../utils/errors';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const { role } = req.query;
  const pRole = role ? (role as Role) : undefined;

  const users = await userService.getUsers(pRole);

  res.status(200).json({
    success: true,
    message: 'Utilisateurs récupérés',
    data: users,
  });
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = await userService.getUserById(parseInt(id as string, 10));

  res.status(200).json({
    success: true,
    message: 'Utilisateur récupéré',
    data: user,
  });
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const user = await userService.createUser(req.body);

  res.status(201).json({
    success: true,
    message: 'Utilisateur créé',
    data: user,
  });
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = await userService.updateUser(parseInt(id as string, 10), req.body);

  res.status(200).json({
    success: true,
    message: 'Utilisateur mis à jour',
    data: user,
  });
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!req.user) {
    throw new UnauthorizedError('Utilisateur non authentifié');
  }

  await userService.deleteUser(parseInt(id as string, 10), req.user.userId);

  res.status(200).json({
    success: true,
    message: 'Utilisateur désactivé',
  });
};

export const getTechniciens = async (req: Request, res: Response): Promise<void> => {
  const techniciens = await userService.getTechniciens();

  res.status(200).json({
    success: true,
    message: 'Techniciens récupérés',
    data: techniciens,
  });
};
