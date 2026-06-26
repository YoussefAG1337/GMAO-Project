/**
 * @fileoverview Contrôleur des Utilisateurs
 */

import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import prisma from '../config/prisma';
import { hashPassword } from '../utils/password';

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, actif } = req.query;

    const where: any = {};
    if (role) where.role = role;
    if (actif !== undefined) where.actif = actif === 'true';

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        actif: true,
        dernierLogin: true,
        createdAt: true,
        _count: { select: { ordresTravailTechnicien: true } },
      },
      orderBy: { nom: 'asc' },
    });

    res.status(200).json({
      success: true,
      message: 'Utilisateurs récupérés',
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        actif: true,
        dernierLogin: true,
        createdAt: true,
        loginAudits: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Utilisateur récupéré',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { nom, prenom, email, motDePasse, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
      return;
    }

    const hashedPassword = await hashPassword(motDePasse);

    const user = await prisma.user.create({
      data: {
        nom,
        prenom,
        email,
        motDePasse: hashedPassword,
        role,
      },
      select: { id: true, nom: true, prenom: true, email: true, role: true, actif: true },
    });

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, ...updateData } = req.body;

    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== parseInt(id, 10)) {
        res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
        return;
      }
      updateData.email = email;
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
      select: { id: true, nom: true, prenom: true, email: true, role: true, actif: true },
    });

    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (parseInt(id, 10) === req.user!.userId) {
      res
        .status(400)
        .json({ success: false, message: 'Vous ne pouvez pas vous supprimer vous-même' });
      return;
    }

    await prisma.user.update({
      where: { id: parseInt(id, 10) },
      data: { actif: false },
    });

    res.status(200).json({
      success: true,
      message: 'Utilisateur désactivé',
    });
  } catch (error) {
    next(error);
  }
};

export const getTechniciens = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const techniciens = await prisma.user.findMany({
      where: { role: Role.TECHNICIEN, actif: true },
      select: { id: true, nom: true, prenom: true },
      orderBy: { nom: 'asc' },
    });

    res.status(200).json({
      success: true,
      message: 'Techniciens récupérés',
      data: techniciens,
    });
  } catch (error) {
    next(error);
  }
};
