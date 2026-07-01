import { StatutOT } from '@prisma/client';
import prisma from '../config/prisma';
import { ICalendarService } from '../interfaces/services/ICalendarService';

class CalendarService implements ICalendarService {
  public async getCalendarData(month: number, year: number) {
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

    return { ots, upcomingPlans };
  }
}

export const calendarService = new CalendarService();
