/**
 * @fileoverview Contrôleur des Plans de Maintenance
 */

import { Request, Response, NextFunction } from 'express';
import { FrequenceMaintenance } from '@prisma/client';
import prisma from '../config/prisma';

export const getPlans = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { actif, atelierId, frequence } = req.query;

    const where: any = {};
    if (actif !== undefined) where.actif = actif === 'true';
    if (atelierId) where.atelierId = parseInt(atelierId as string, 10);
    if (frequence) where.frequence = frequence;

    const plans = await prisma.planMaintenance.findMany({
      where,
      include: {
        atelier: { select: { nom: true } },
        ligne: { select: { nom: true } },
        poste: { select: { nom: true } },
        creePar: { select: { nom: true, prenom: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      message: 'Plans de maintenance récupérés',
      data: plans
    });
  } catch (error) {
    next(error);
  }
};

export const getPlanById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const plan = await prisma.planMaintenance.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        atelier: true,
        ligne: true,
        poste: true,
        creePar: { select: { id: true, nom: true, prenom: true } },
        ordresTravail: {
          orderBy: { datePrevue: 'desc' },
          take: 10
        }
      }
    });

    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan introuvable' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Plan récupéré',
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

export const createPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { intitule, description, atelierId, ligneId, posteId, frequence, prochaineExecution } = req.body;

    const prochaineDate = prochaineExecution ? new Date(prochaineExecution) : new Date();

    if (!prochaineExecution) {
      // Calcul basique depuis aujourd'hui si non fourni
      switch (frequence) {
        case FrequenceMaintenance.HEBDOMADAIRE: prochaineDate.setDate(prochaineDate.getDate() + 7); break;
        case FrequenceMaintenance.MENSUELLE: prochaineDate.setMonth(prochaineDate.getMonth() + 1); break;
        case FrequenceMaintenance.TRIMESTRIELLE: prochaineDate.setMonth(prochaineDate.getMonth() + 3); break;
        case FrequenceMaintenance.SEMESTRIELLE: prochaineDate.setMonth(prochaineDate.getMonth() + 6); break;
        case FrequenceMaintenance.ANNUELLE: prochaineDate.setFullYear(prochaineDate.getFullYear() + 1); break;
      }
    }

    const plan = await prisma.planMaintenance.create({
      data: {
        intitule,
        description,
        atelierId,
        ligneId,
        posteId,
        frequence,
        prochaineExecution: prochaineDate,
        creeParId: userId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Plan de maintenance créé',
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { prochaineExecution, ...updateData } = req.body;

    if (prochaineExecution) {
      updateData.prochaineExecution = new Date(prochaineExecution);
    }

    const plan = await prisma.planMaintenance.update({
      where: { id: parseInt(id, 10) },
      data: updateData
    });

    res.status(200).json({
      success: true,
      message: 'Plan mis à jour',
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

export const deletePlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.planMaintenance.delete({
      where: { id: parseInt(id, 10) }
    });

    res.status(200).json({
      success: true,
      message: 'Plan de maintenance supprimé'
    });
  } catch (error) {
    next(error);
  }
};
