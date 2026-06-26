/**
 * @fileoverview Contrôleur des Demandes d'Intervention (DI)
 * @description Gère le cycle de vie des signalements d'incidents
 */

import { Request, Response, NextFunction } from 'express';
import { StatutDI } from '@prisma/client';
import prisma from '../config/prisma';

export const getDIs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { statut, priorite, atelierId, ligneId, posteId, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (statut) where.statut = statut;
    if (priorite) where.priorite = priorite;
    if (atelierId) where.atelierId = parseInt(atelierId as string, 10);
    if (ligneId) where.ligneId = parseInt(ligneId as string, 10);
    if (posteId) where.posteId = parseInt(posteId as string, 10);

    const [total, dis] = await Promise.all([
      prisma.demandeIntervention.count({ where }),
      prisma.demandeIntervention.findMany({
        where,
        include: {
          atelier: { select: { nom: true } },
          ligne: { select: { nom: true } },
          poste: { select: { nom: true } },
          declarePar: { select: { nom: true, prenom: true } },
        },
        orderBy: { dateDeclaration: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "Demandes d'intervention récupérées avec succès",
      data: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        dis,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDIById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const di = await prisma.demandeIntervention.findUnique({
      where: { id: parseInt(id as string, 10) },
      include: {
        atelier: true,
        ligne: true,
        poste: true,
        declarePar: { select: { id: true, nom: true, prenom: true, email: true } },
        ordresTravail: {
          include: { technicien: { select: { nom: true, prenom: true } } },
        },
      },
    });

    if (!di) {
      res.status(404).json({
        success: false,
        message: "Demande d'intervention introuvable",
        code: 'NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Demande d'intervention récupérée avec succès",
      data: di,
    });
  } catch (error) {
    next(error);
  }
};

export const createDI = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const {
      atelierId,
      ligneId,
      posteId,
      produit,
      referenceProduit,
      familleProduit,
      description,
      priorite,
    } = req.body;

    // Validate hierarchy consistency
    const poste = await prisma.poste.findUnique({ where: { id: posteId } });
    if (!poste || poste.ligneId !== ligneId) {
      res.status(400).json({
        success: false,
        message: "Le poste n'existe pas ou n'appartient pas à la ligne spécifiée",
        code: 'BAD_REQUEST',
      });
      return;
    }

    const ligne = await prisma.ligne.findUnique({ where: { id: ligneId } });
    if (!ligne || ligne.atelierId !== atelierId) {
      res.status(400).json({
        success: false,
        message: "La ligne n'existe pas ou n'appartient pas à l'atelier spécifié",
        code: 'BAD_REQUEST',
      });
      return;
    }

    // Create DI with a temporary numeroDI
    const di = await prisma.demandeIntervention.create({
      data: {
        numeroDI: 'TEMP-' + Date.now(),
        atelierId,
        ligneId,
        posteId,
        produit,
        referenceProduit,
        familleProduit,
        description,
        priorite,
        declareParId: userId,
      },
    });

    // Update with proper formatted numeroDI
    const formattedNumero = 'DI-' + di.id.toString().padStart(6, '0');
    const updatedDi = await prisma.demandeIntervention.update({
      where: { id: di.id },
      data: { numeroDI: formattedNumero },
    });

    res.status(201).json({
      success: true,
      message: "Demande d'intervention créée avec succès",
      data: updatedDi,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDI = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const di = await prisma.demandeIntervention.update({
      where: { id: parseInt(id as string, 10) },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: "Demande d'intervention mise à jour avec succès",
      data: di,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDI = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const di = await prisma.demandeIntervention.findUnique({
      where: { id: parseInt(id as string, 10) },
    });
    if (!di) {
      res.status(404).json({ success: false, message: 'DI introuvable' });
      return;
    }

    if (di.statut !== StatutDI.NOUVELLE) {
      res.status(400).json({
        success: false,
        message: "Impossible de supprimer une DI qui n'est plus à l'état NOUVELLE",
        code: 'BAD_REQUEST',
      });
      return;
    }

    await prisma.demandeIntervention.delete({
      where: { id: parseInt(id as string, 10) },
    });

    res.status(200).json({
      success: true,
      message: "Demande d'intervention supprimée avec succès",
    });
  } catch (error) {
    next(error);
  }
};

export const getDIStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const stats = await prisma.demandeIntervention.groupBy({
      by: ['statut'],
      _count: true,
    });

    res.status(200).json({
      success: true,
      message: 'Statistiques des DI récupérées',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
