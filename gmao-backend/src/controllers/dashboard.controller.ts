import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  const data = await dashboardService.getDashboardStats();

  res.status(200).json({
    success: true,
    message: 'Statistiques du tableau de bord récupérées',
    data,
  });
};

export const getKPIs = async (req: Request, res: Response): Promise<void> => {
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
};
