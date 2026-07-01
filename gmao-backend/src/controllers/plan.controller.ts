/**
 * @fileoverview Contrôleur des Plans de Maintenance
 */

import { Request, Response, NextFunction } from 'express';
import { planService } from '../services/plan.service';
import { UnauthorizedError } from '../utils/errors';

export const getPlans = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { actif, atelierId, frequence } = req.query;

    const filters: any = {};
    if (actif !== undefined) filters.actif = actif === 'true';
    if (atelierId) filters.atelierId = parseInt(atelierId as string, 10);
    if (frequence) filters.frequence = frequence;

    const plans = await planService.getPlans(filters);

    res.status(200).json({
      success: true,
      message: 'Plans de maintenance récupérés',
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlanById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const plan = await planService.getPlanById(parseInt(id as string, 10));

    res.status(200).json({
      success: true,
      message: 'Plan récupéré',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

export const createPlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Utilisateur non authentifié');
    }

    const plan = await planService.createPlan(req.user.userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Plan de maintenance créé',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const plan = await planService.updatePlan(parseInt(id as string, 10), req.body);

    res.status(200).json({
      success: true,
      message: 'Plan mis à jour',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    await planService.deletePlan(parseInt(id as string, 10));

    res.status(200).json({
      success: true,
      message: 'Plan de maintenance supprimé',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Déclenche manuellement la génération d'un OT préventif à partir d'un plan.
 * @route POST /api/plans/:id/trigger
 */
export const triggerPlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const ot = await planService.triggerPlan(parseInt(id as string, 10));

    res.status(201).json({
      success: true,
      message: 'OT préventif généré avec succès',
      data: ot,
    });
  } catch (error) {
    next(error);
  }
};
