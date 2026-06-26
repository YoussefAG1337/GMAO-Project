/**
 * @fileoverview Contrôleur des équipements (Atelier, Ligne, Poste)
 * @description Gère le CRUD pour la structure hiérarchique de l'usine
 */

import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

// ==========================================
// ATELIERS
// ==========================================

export const getAteliers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { actif } = req.query;

    const where = actif !== undefined ? { actif: actif === 'true' } : {};

    const ateliers = await prisma.atelier.findMany({
      where,
      include: {
        _count: {
          select: { lignes: true },
        },
      },
      orderBy: { nom: 'asc' },
    });

    res.status(200).json({
      success: true,
      message: 'Ateliers récupérés avec succès',
      data: ateliers,
    });
  } catch (error) {
    next(error);
  }
};

export const getAtelierById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const atelier = await prisma.atelier.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        lignes: {
          include: {
            _count: {
              select: { postes: true },
            },
          },
        },
      },
    });

    if (!atelier) {
      res.status(404).json({
        success: false,
        message: 'Atelier introuvable',
        code: 'NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Atelier récupéré avec succès',
      data: atelier,
    });
  } catch (error) {
    next(error);
  }
};

export const createAtelier = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { nom, description } = req.body;

    const atelier = await prisma.atelier.create({
      data: { nom, description },
    });

    res.status(201).json({
      success: true,
      message: 'Atelier créé avec succès',
      data: atelier,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAtelier = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { nom, description, actif } = req.body;

    const atelier = await prisma.atelier.update({
      where: { id: parseInt(id, 10) },
      data: { nom, description, actif },
    });

    res.status(200).json({
      success: true,
      message: 'Atelier mis à jour avec succès',
      data: atelier,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAtelier = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const atelier = await prisma.atelier.update({
      where: { id: parseInt(id, 10) },
      data: { actif: false },
    });

    res.status(200).json({
      success: true,
      message: 'Atelier supprimé (désactivé) avec succès',
      data: atelier,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// LIGNES
// ==========================================

export const getLignes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { actif, atelierId } = req.query;

    const where: any = {};
    if (actif !== undefined) where.actif = actif === 'true';
    if (atelierId) where.atelierId = parseInt(atelierId as string, 10);

    const lignes = await prisma.ligne.findMany({
      where,
      include: {
        atelier: { select: { nom: true } },
        _count: { select: { postes: true } },
      },
      orderBy: { nom: 'asc' },
    });

    res.status(200).json({
      success: true,
      message: 'Lignes récupérées avec succès',
      data: lignes,
    });
  } catch (error) {
    next(error);
  }
};

export const getLigneById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const ligne = await prisma.ligne.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        atelier: true,
        postes: true,
      },
    });

    if (!ligne) {
      res.status(404).json({
        success: false,
        message: 'Ligne introuvable',
        code: 'NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Ligne récupérée avec succès',
      data: ligne,
    });
  } catch (error) {
    next(error);
  }
};

export const createLigne = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { nom, description, atelierId } = req.body;

    // Verify atelier exists
    const atelierExists = await prisma.atelier.findUnique({ where: { id: atelierId } });
    if (!atelierExists) {
      res.status(400).json({
        success: false,
        message: "L'atelier spécifié n'existe pas",
        code: 'BAD_REQUEST',
      });
      return;
    }

    const ligne = await prisma.ligne.create({
      data: { nom, description, atelierId },
    });

    res.status(201).json({
      success: true,
      message: 'Ligne créée avec succès',
      data: ligne,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLigne = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { nom, description, atelierId, actif } = req.body;

    if (atelierId) {
      const atelierExists = await prisma.atelier.findUnique({ where: { id: atelierId } });
      if (!atelierExists) {
        res.status(400).json({
          success: false,
          message: "L'atelier spécifié n'existe pas",
          code: 'BAD_REQUEST',
        });
        return;
      }
    }

    const ligne = await prisma.ligne.update({
      where: { id: parseInt(id, 10) },
      data: { nom, description, atelierId, actif },
    });

    res.status(200).json({
      success: true,
      message: 'Ligne mise à jour avec succès',
      data: ligne,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLigne = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const ligne = await prisma.ligne.update({
      where: { id: parseInt(id, 10) },
      data: { actif: false },
    });

    res.status(200).json({
      success: true,
      message: 'Ligne supprimée (désactivée) avec succès',
      data: ligne,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// POSTES
// ==========================================

export const getPostes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { actif, ligneId } = req.query;

    const where: any = {};
    if (actif !== undefined) where.actif = actif === 'true';
    if (ligneId) where.ligneId = parseInt(ligneId as string, 10);

    const postes = await prisma.poste.findMany({
      where,
      include: {
        ligne: {
          select: {
            nom: true,
            atelier: { select: { nom: true } },
          },
        },
      },
      orderBy: { nom: 'asc' },
    });

    res.status(200).json({
      success: true,
      message: 'Postes récupérés avec succès',
      data: postes,
    });
  } catch (error) {
    next(error);
  }
};

export const getPosteById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const poste = await prisma.poste.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        ligne: {
          include: { atelier: true },
        },
      },
    });

    if (!poste) {
      res.status(404).json({
        success: false,
        message: 'Poste introuvable',
        code: 'NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Poste récupéré avec succès',
      data: poste,
    });
  } catch (error) {
    next(error);
  }
};

export const createPoste = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { nom, description, ligneId } = req.body;

    const ligneExists = await prisma.ligne.findUnique({ where: { id: ligneId } });
    if (!ligneExists) {
      res.status(400).json({
        success: false,
        message: "La ligne spécifiée n'existe pas",
        code: 'BAD_REQUEST',
      });
      return;
    }

    const poste = await prisma.poste.create({
      data: { nom, description, ligneId },
    });

    res.status(201).json({
      success: true,
      message: 'Poste créé avec succès',
      data: poste,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePoste = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { nom, description, ligneId, actif } = req.body;

    if (ligneId) {
      const ligneExists = await prisma.ligne.findUnique({ where: { id: ligneId } });
      if (!ligneExists) {
        res.status(400).json({
          success: false,
          message: "La ligne spécifiée n'existe pas",
          code: 'BAD_REQUEST',
        });
        return;
      }
    }

    const poste = await prisma.poste.update({
      where: { id: parseInt(id, 10) },
      data: { nom, description, ligneId, actif },
    });

    res.status(200).json({
      success: true,
      message: 'Poste mis à jour avec succès',
      data: poste,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePoste = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const poste = await prisma.poste.update({
      where: { id: parseInt(id, 10) },
      data: { actif: false },
    });

    res.status(200).json({
      success: true,
      message: 'Poste supprimé (désactivé) avec succès',
      data: poste,
    });
  } catch (error) {
    next(error);
  }
};
