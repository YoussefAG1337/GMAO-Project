import { StatutDI, StatutOT, Role } from '@prisma/client';
import prisma from '../config/prisma';
import { IDashboardService } from '../interfaces/services/IDashboardService';

class DashboardService implements IDashboardService {
  public async getDashboardStats() {
    const [
      incidentsOuverts,
      otEnCours,
      otEnAttenteValidation,
      pannesParLigneGroup,
      pannesParPosteGroup,
      repartitionType,
    ] = await Promise.all([
      prisma.demandeIntervention.count({
        where: { statut: { in: [StatutDI.NOUVELLE, StatutDI.EN_COURS] } },
      }),
      prisma.ordreTravail.count({ where: { statut: StatutOT.EN_COURS } }),
      prisma.ordreTravail.count({ where: { statut: StatutOT.EN_ATTENTE_VALIDATION } }),
      prisma.demandeIntervention.groupBy({ by: ['ligneId'], _count: true }),
      prisma.demandeIntervention.groupBy({ by: ['posteId'], _count: true }),
      prisma.ordreTravail.groupBy({ by: ['typeMaintenance'], _count: true }),
    ]);

    const lignes = await prisma.ligne.findMany({ select: { id: true, nom: true } });
    const postes = await prisma.poste.findMany({ select: { id: true, nom: true } });

    const pannesParLigne = pannesParLigneGroup.map((g) => ({
      ligneId: g.ligneId,
      ligneNom: lignes.find((l) => l.id === g.ligneId)?.nom || 'Inconnue',
      count: g._count,
    }));

    const pannesParPoste = pannesParPosteGroup.map((g) => ({
      posteId: g.posteId,
      posteNom: postes.find((p) => p.id === g.posteId)?.nom || 'Inconnu',
      count: g._count,
    }));

    const repartitionCorrectivePreventive = {
      corrective: repartitionType.find((r) => r.typeMaintenance === 'CORRECTIVE')?._count || 0,
      preventive: repartitionType.find((r) => r.typeMaintenance === 'PREVENTIVE')?._count || 0,
    };

    return {
      incidentsOuverts,
      otEnCours,
      otEnAttenteValidation,
      pannesParLigne,
      pannesParPoste,
      repartitionCorrectivePreventive,
    };
  }

  public async getKPIs(filters: any) {
    const whereClause: any = {};
    if (filters.dateDebut && filters.dateFin) {
      whereClause.createdAt = {
        gte: new Date(filters.dateDebut as string),
        lte: new Date(filters.dateFin as string),
      };
    }

    // Nombre de DI
    const nombreDI = await prisma.demandeIntervention.count({ where: whereClause });

    // OTs
    const ots = await prisma.ordreTravail.findMany({
      where: whereClause,
      include: { rapportIntervention: true },
    });

    const nombreOT = ots.length;
    const repartition = {
      corrective: ots.filter((o) => o.typeMaintenance === 'CORRECTIVE').length,
      preventive: ots.filter((o) => o.typeMaintenance === 'PREVENTIVE').length,
    };

    // MTTR & Durée pannes
    const rapports = ots.filter((o) => o.rapportIntervention).map((o) => o.rapportIntervention!);
    const totalTempsInterventionMinutes = rapports.reduce((acc, r) => acc + r.tempsIntervention, 0);
    const dureeTotalePannesMinutes = rapports.reduce((acc, r) => acc + (r.tempsArret || 0), 0);

    const mttr = rapports.length > 0 ? totalTempsInterventionMinutes / 60 / rapports.length : 0;
    const dureeTotalePannes = dureeTotalePannesMinutes / 60;

    // MTBF (approximation simplifiée pour le PoC : 24h/jour * 30 jours = 720h de ref)
    const hoursInRange = 720;
    const mtbf = nombreDI > 0 ? hoursInRange / nombreDI : 0;

    // Disponibilité
    const disponibilite = Math.max(0, ((hoursInRange - dureeTotalePannes) / hoursInRange) * 100);

    // Taux occupation techniciens
    const techniciens = await prisma.user.findMany({ where: { role: Role.TECHNICIEN } });
    const tauxOccupationTechniciens = techniciens.map((tech) => {
      const techOTs = ots.filter(
        (o) =>
          o.technicienId === tech.id &&
          ['EN_COURS', 'FERME', 'EN_ATTENTE_VALIDATION'].includes(o.statut),
      );
      const hoursWorked = techOTs.length * 2; // approximation: 2h per OT
      const totalHours = 160; // 1 month
      return {
        technicienId: tech.id,
        nom: tech.nom,
        prenom: tech.prenom,
        tauxOccupation: Math.min(100, (hoursWorked / totalHours) * 100),
      };
    });

    return {
      mtbf,
      mttr,
      dureeTotalePannes,
      disponibilite,
      tauxOccupationTechniciens,
      chargeJournaliere: ots.filter((o) => o.statut !== 'FERME').length / 30,
      chargeHebdomadaire: ots.filter((o) => o.statut !== 'FERME').length / 4,
      nombreDI,
      nombreOT,
      repartition,
    };
  }
}

export const dashboardService = new DashboardService();
