/**
 * @fileoverview Tâche planifiée pour la génération des OT préventifs
 * @description Utilise le service preventive.service pour la logique métier.
 *              Chaque plan est traité indépendamment afin qu'un échec
 *              individuel ne bloque pas le reste du lot.
 */

import cron from 'node-cron';
import prisma from '../config/prisma';
import { generateOTFromPlan } from '../services/preventive.service';
import { logger } from '../utils/logger';

const log = logger.child({ module: 'preventive-cron' });

export const initPreventiveCron = () => {
  // Exécution quotidienne à 06:00
  cron.schedule('0 6 * * *', async () => {
    log.info('Début de la génération des OTs préventifs...');

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
        log.info({ plan: plan.intitule }, 'OT généré');
      } catch (error) {
        log.error({ plan: plan.intitule, err: error }, 'Échec de génération');
      }
    }

    log.info({ count: generatedCount }, 'OTs préventifs générés.');
  });

  log.info('Tâche de maintenance préventive initialisée.');
};
