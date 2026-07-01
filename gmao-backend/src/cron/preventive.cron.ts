/**
 * @fileoverview Tâche planifiée pour la génération des OT préventifs
 * @description Utilise le service preventive.service pour la logique métier.
 *              Chaque plan est traité indépendamment afin qu'un échec
 *              individuel ne bloque pas le reste du lot.
 */

import cron from 'node-cron';
import prisma from '../config/prisma';
import { generateOTFromPlan } from '../services/preventive.service';

export const initPreventiveCron = () => {
  // Exécution quotidienne à 06:00
  cron.schedule('0 6 * * *', async () => {
    console.log('[CRON] Début de la génération des OTs préventifs...');

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
      try {
        await generateOTFromPlan(plan.id);
        generatedCount++;
        console.log(`[CRON] ✅ OT généré pour le plan "${plan.intitule}"`);
      } catch (error) {
        console.error(`[CRON] ❌ Échec de génération pour le plan "${plan.intitule}":`, error);
      }
    }

    console.log(`[CRON] ${generatedCount} OTs préventifs générés.`);
  });

  console.log('[CRON] Tâche de maintenance préventive initialisée.');
};
