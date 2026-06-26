/**
 * @fileoverview Tâche planifiée pour la génération des OT préventifs
 */

import cron from 'node-cron';
import prisma from '../config/prisma';
import { TypeMaintenance, Priorite, FrequenceMaintenance, StatutOT } from '@prisma/client';

export const initPreventiveCron = () => {
  // Run everyday at 06:00
  cron.schedule('0 6 * * *', async () => {
    console.log('[CRON] Début de la génération des OTs préventifs...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const plans = await prisma.planMaintenance.findMany({
        where: {
          actif: true,
          prochaineExecution: {
            lte: today,
          },
        },
      });

      let generatedCount = 0;

      for (const plan of plans) {
        const nextDate = new Date(plan.prochaineExecution || today);

        switch (plan.frequence) {
          case FrequenceMaintenance.HEBDOMADAIRE:
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case FrequenceMaintenance.MENSUELLE:
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case FrequenceMaintenance.TRIMESTRIELLE:
            nextDate.setMonth(nextDate.getMonth() + 3);
            break;
          case FrequenceMaintenance.SEMESTRIELLE:
            nextDate.setMonth(nextDate.getMonth() + 6);
            break;
          case FrequenceMaintenance.ANNUELLE:
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
        }

        const ot = await prisma.ordreTravail.create({
          data: {
            numeroOT: 'TEMP-' + Date.now() + Math.floor(Math.random() * 1000),
            atelierId: plan.atelierId,
            ligneId: plan.ligneId,
            posteId: plan.posteId,
            typeMaintenance: TypeMaintenance.PREVENTIVE,
            planMaintenanceId: plan.id,
            description: plan.description || plan.intitule,
            priorite: Priorite.MOYENNE,
            datePrevue: today,
            statut: StatutOT.CREE,
          },
        });

        await prisma.ordreTravail.update({
          where: { id: ot.id },
          data: { numeroOT: 'OT-' + ot.id.toString().padStart(6, '0') },
        });

        await prisma.planMaintenance.update({
          where: { id: plan.id },
          data: {
            dernierExecution: new Date(),
            prochaineExecution: nextDate,
          },
        });

        generatedCount++;
      }

      console.log(`[CRON] ${generatedCount} OTs préventifs générés.`);
    } catch (error) {
      console.error('[CRON] Erreur lors de la génération des OTs préventifs:', error);
    }
  });

  console.log('[CRON] Tâche de maintenance préventive initialisée.');
};
