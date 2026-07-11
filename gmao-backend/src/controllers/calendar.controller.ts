import { Request, Response, NextFunction } from 'express';
import { calendarService } from '../services/calendar.service';

/**
 * Récupère les données du calendrier pour un mois donné.
 * Retourne les OTs avec datePrevue dans le mois, ainsi que les plans
 * actifs dont la prochaineExecution tombe dans le mois (pas encore générés).
 * @route GET /api/calendar?month=7&year=2026
 */
export const getCalendarData = async (req: Request, res: Response): Promise<void> => {
  const month = parseInt(req.query.month as string, 10) || new Date().getMonth() + 1;
  const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();

  const data = await calendarService.getCalendarData(month, year);

  res.status(200).json({
    success: true,
    message: 'Données du calendrier récupérées',
    data,
  });
};
