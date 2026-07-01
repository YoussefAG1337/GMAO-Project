/**
 * @fileoverview Contrôleur du Tableau de Bord et des KPIs
 */

import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await dashboardService.getDashboardStats();

    res.status(200).json({
      success: true,
      message: 'Statistiques du tableau de bord récupérées',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getKPIs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filters = {
      dateDebut: req.query.dateDebut,
      dateFin: req.query.dateFin,
    };

    const data = await dashboardService.getKPIs(filters);

    res.status(200).json({
      success: true,
      message: 'KPIs récupérés',
      data,
    });
  } catch (error) {
    next(error);
  }
};
