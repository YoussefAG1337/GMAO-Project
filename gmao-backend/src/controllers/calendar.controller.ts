/**
 * @fileoverview Contrôleur du Calendrier de Maintenance
 * @description Fournit les données pour la vue calendrier :
 *              OTs planifiés et plans préventifs à venir.
 */

import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

/**
 * Récupère les données du calendrier pour un mois donné.
 * Retourne les OTs avec datePrevue dans le mois, ainsi que les plans
 * actifs dont la prochaineExecution tombe dans le mois (pas encore générés).
 * @route GET /api/calendar?month=7&year=2026
 */
export const getCalendarData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const month = parseInt(req.query.month as string, 10) || (new Date().getMonth() + 1);
    const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();

    // Calculer le premier et le dernier jour du mois
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Dernier jour du mois
    endDate.setHours(23, 59, 59, 999);

    // Récupérer les OTs avec datePrevue dans le mois
    const ots = await prisma.ordreTravail.findMany({
      where: {
        datePrevue: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        technicien: { select: { id: true, nom: true, prenom: true } },
        atelier: { select: { nom: true } },
        ligne: { select: { nom: true } },
        poste: { select: { nom: true } },
        planMaintenance: { select: { id: true, intitule: true } },
      },
      orderBy: { datePrevue: 'asc' },
    });

    // Récupérer les plans actifs avec prochaineExecution dans le mois
    // Ce sont les événements « à venir mais pas encore générés »
    const upcomingPlans = await prisma.planMaintenance.findMany({
      where: {
        actif: true,
        prochaineExecution: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        atelier: { select: { nom: true } },
        ligne: { select: { nom: true } },
        poste: { select: { nom: true } },
      },
      orderBy: { prochaineExecution: 'asc' },
    });

    res.status(200).json({
      success: true,
      message: 'Données du calendrier récupérées',
      data: { ots, upcomingPlans },
    });
  } catch (error) {
    next(error);
  }
};
