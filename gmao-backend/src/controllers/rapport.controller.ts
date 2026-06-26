/**
 * @fileoverview Contrôleur des Rapports d'Intervention
 */

import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import prisma from '../config/prisma';

export const getRapports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const where: any = {};
    if (req.user!.role === Role.TECHNICIEN) {
      where.redacteurId = req.user!.userId;
    }

    const rapports = await prisma.rapportIntervention.findMany({
      where,
      include: {
        ordreTravail: { 
          include: {
            atelier: { select: { nom: true } },
            ligne: { select: { nom: true } },
            poste: { select: { nom: true } }
          }
        },
        redacteur: { select: { nom: true, prenom: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      message: 'Rapports récupérés',
      data: rapports
    });
  } catch (error) {
    next(error);
  }
};

export const getRapportById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const rapport = await prisma.rapportIntervention.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        ordreTravail: true,
        redacteur: { select: { nom: true, prenom: true } }
      }
    });

    if (!rapport) {
      res.status(404).json({ success: false, message: 'Rapport introuvable' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Rapport récupéré',
      data: rapport
    });
  } catch (error) {
    next(error);
  }
};

export const getRapportByOT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { otId } = req.params;

    const rapport = await prisma.rapportIntervention.findUnique({
      where: { ordreTravailId: parseInt(otId, 10) }
    });

    if (!rapport) {
      res.status(404).json({ success: false, message: 'Rapport introuvable pour cet OT' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Rapport récupéré',
      data: rapport
    });
  } catch (error) {
    next(error);
  }
};
