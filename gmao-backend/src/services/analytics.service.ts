import { StatutDI, StatutOT } from '@prisma/client';
import prisma from '../config/prisma';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns';

export class AnalyticsService {
  public async getDashboardAnalytics(startDate?: Date, endDate?: Date) {
    const whereClause: any = {};
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const [
      totalDI,
      diWithOT,
      diStatusGroup,
      otStatusGroup,
      diPerLigneGroup,
      otPerLigneGroup,
      rapports,
      lignes,
    ] = await Promise.all([
      // Total DI
      prisma.demandeIntervention.count({ where: whereClause }),
      // DI that were converted to OT
      prisma.demandeIntervention.count({
        where: {
          ...whereClause,
          ordresTravail: { some: {} },
        },
      }),
      // DI by status
      prisma.demandeIntervention.groupBy({
        by: ['statut'],
        _count: true,
        where: whereClause,
      }),
      // OT by status
      prisma.ordreTravail.groupBy({
        by: ['statut'],
        _count: true,
        where: whereClause,
      }),
      // DI per ligne
      prisma.demandeIntervention.groupBy({
        by: ['ligneId'],
        _count: true,
        where: whereClause,
      }),
      // OT per ligne
      prisma.ordreTravail.groupBy({
        by: ['ligneId'],
        _count: true,
        where: whereClause,
      }),
      // Rapports for average times
      prisma.rapportIntervention.findMany({
        where: {
          ordreTravail: whereClause,
        },
        include: {
          ordreTravail: {
            select: {
              ligneId: true,
              demandeIntervention: {
                select: { panne: { select: { nom: true } } },
              },
            },
          },
        },
      }),
      // Fetch all lignes to map names
      prisma.ligne.findMany({ select: { id: true, nom: true } }),
    ]);

    const conversionRate = totalDI > 0 ? Math.round((diWithOT / totalDI) * 100) : 0;

    // Process statuses
    const diEnCours = diStatusGroup
      .filter((g) => g.statut === StatutDI.EN_COURS || g.statut === StatutDI.NOUVELLE)
      .reduce((acc, g) => acc + g._count, 0);
    const diCloture = diStatusGroup
      .filter((g) => g.statut === StatutDI.RESOLUE || g.statut === StatutDI.CLOTUREE)
      .reduce((acc, g) => acc + g._count, 0);

    const otEnCours = otStatusGroup
      .filter(
        (g) =>
          g.statut === StatutOT.CREE ||
          g.statut === StatutOT.ASSIGNE ||
          g.statut === StatutOT.EN_COURS ||
          g.statut === StatutOT.EN_ATTENTE_VALIDATION,
      )
      .reduce((acc, g) => acc + g._count, 0);
    const otCloture = otStatusGroup
      .filter((g) => g.statut === StatutOT.FERME)
      .reduce((acc, g) => acc + g._count, 0);

    // Map DI & OT per Ligne
    const getLigneName = (id: number) => lignes.find((l) => l.id === id)?.nom || `Ligne ${id}`;

    const diPerLigne = diPerLigneGroup.map((g) => ({
      ligne: getLigneName(g.ligneId),
      count: g._count,
    }));

    const otPerLigne = otPerLigneGroup.map((g) => ({
      ligne: getLigneName(g.ligneId),
      count: g._count,
    }));

    // Process Average Time per Panne (causePanne)
    const timePerPanneMap = new Map<string, { total: number; count: number }>();
    const timePerLigneMap = new Map<number, { total: number; count: number }>();

    for (const rapport of rapports as any[]) {
      const cause =
        rapport.ordreTravail?.demandeIntervention?.panne?.nom ||
        rapport.causePanne?.trim() ||
        'Non spécifié';
      const time = rapport.tempsIntervention; // in minutes

      // By panne
      const panneStats = timePerPanneMap.get(cause) || { total: 0, count: 0 };
      panneStats.total += time;
      panneStats.count += 1;
      timePerPanneMap.set(cause, panneStats);

      // By ligne
      const ligneId = rapport.ordreTravail.ligneId;
      const ligneStats = timePerLigneMap.get(ligneId) || { total: 0, count: 0 };
      ligneStats.total += time;
      ligneStats.count += 1;
      timePerLigneMap.set(ligneId, ligneStats);
    }

    const timePerPanne = Array.from(timePerPanneMap.entries()).map(([cause, stats]) => ({
      panne: cause,
      averageTimeMinutes: Math.round(stats.total / stats.count),
    }));

    const timePerLigne = Array.from(timePerLigneMap.entries()).map(([ligneId, stats]) => ({
      ligne: getLigneName(ligneId),
      averageTimeMinutes: Math.round(stats.total / stats.count),
    }));

    return {
      totalDI,
      conversionRate,
      di: {
        enCours: diEnCours,
        cloture: diCloture,
        perLigne: diPerLigne,
      },
      ot: {
        enCours: otEnCours,
        cloture: otCloture,
        perLigne: otPerLigne,
      },
      timePerPanne,
      timePerLigne,
    };
  }

  /**
   * Compute workrate (total tempsIntervention in minutes) for each active technician
   * over three windows anchored on the given date:
   *   - daily:   the given day
   *   - weekly:  the Monday–Sunday week containing that day
   *   - monthly: the full calendar month containing that day
   */
  public async getTechnicianWorkrates(anchorDate: Date) {
    const dayStart = startOfDay(anchorDate);
    const dayEnd = endOfDay(anchorDate);
    const weekStart = startOfWeek(anchorDate, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(anchorDate, { weekStartsOn: 1 });     // Sunday
    const monthStart = startOfMonth(anchorDate);
    const monthEnd = endOfMonth(anchorDate);

    // Fetch all active technicians
    const technicians = await prisma.user.findMany({
      where: { role: 'TECHNICIEN', actif: true },
      select: { id: true, nom: true, prenom: true },
      orderBy: { nom: 'asc' },
    });

    // For each technician, aggregate tempsIntervention for the 3 windows
    const results = await Promise.all(
      technicians.map(async (tech) => {
        const sumFor = async (from: Date, to: Date) => {
          const agg = await prisma.rapportIntervention.aggregate({
            _sum: { tempsIntervention: true },
            where: {
              redacteurId: tech.id,
              createdAt: { gte: from, lte: to },
            },
          });
          return agg._sum.tempsIntervention ?? 0;
        };

        const [daily, weekly, monthly] = await Promise.all([
          sumFor(dayStart, dayEnd),
          sumFor(weekStart, weekEnd),
          sumFor(monthStart, monthEnd),
        ]);

        return {
          id: tech.id,
          nom: tech.nom,
          prenom: tech.prenom,
          daily,   // minutes
          weekly,  // minutes
          monthly, // minutes
        };
      }),
    );

    return {
      anchorDate: anchorDate.toISOString(),
      windows: {
        day: { start: dayStart.toISOString(), end: dayEnd.toISOString() },
        week: { start: weekStart.toISOString(), end: weekEnd.toISOString() },
        month: { start: monthStart.toISOString(), end: monthEnd.toISOString() },
      },
      technicians: results,
    };
  }
}

export const analyticsService = new AnalyticsService();
