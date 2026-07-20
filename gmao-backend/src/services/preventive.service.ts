

import prisma from '../config/prisma';
import { FrequenceMaintenance, TypeMaintenance, Priorite, StatutOT } from '@prisma/client';


export function calculateNextExecution(from: Date, frequence: FrequenceMaintenance): Date {
  const next = new Date(from);

  switch (frequence) {
    case FrequenceMaintenance.HEBDOMADAIRE:
      next.setDate(next.getDate() + 7);
      break;
    case FrequenceMaintenance.MENSUELLE:
      next.setMonth(next.getMonth() + 1);
      break;
    case FrequenceMaintenance.TRIMESTRIELLE:
      next.setMonth(next.getMonth() + 3);
      break;
    case FrequenceMaintenance.SEMESTRIELLE:
      next.setMonth(next.getMonth() + 6);
      break;
    case FrequenceMaintenance.ANNUELLE:
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
}


export async function generateOTFromPlan(planId: number) {

  const plan = await prisma.planMaintenance.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new Error('Plan de maintenance introuvable');
  }

  if (!plan.actif) {
    throw new Error('Ce plan de maintenance est inactif');
  }


  const today = new Date();
  today.setHours(0, 0, 0, 0);

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


  const updatedOT = await prisma.ordreTravail.update({
    where: { id: ot.id },
    data: { numeroOT: 'OT-' + ot.id.toString().padStart(6, '0') },
  });


  const nextDate = calculateNextExecution(plan.prochaineExecution || today, plan.frequence);

  await prisma.planMaintenance.update({
    where: { id: plan.id },
    data: {
      dernierExecution: new Date(),
      prochaineExecution: nextDate,
    },
  });

  return updatedOT;
}
