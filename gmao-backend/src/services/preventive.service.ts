/**
 * @fileoverview Service de Maintenance Préventive
 *
 * This is the single source of truth for generating preventive OTs from plans.
 * Both the daily cron job and the manual trigger endpoint call this function.
 *
 * Why a service layer?
 * Controllers handle HTTP (req/res). Crons handle scheduling.
 * Neither should own business logic — that's the service's job.
 * This way, if the logic changes (e.g., we add notifications),
 * we change it in ONE place and both callers get the update.
 */

import prisma from '../config/prisma';
import { FrequenceMaintenance, TypeMaintenance, Priorite, StatutOT } from '@prisma/client';

/**
 * Calculates the next execution date based on a frequency.
 *
 * Why is this its own function? Because both generateOTFromPlan
 * AND the create plan controller need this same logic.
 * Extracting it means zero duplication.
 *
 * We take a "from" date parameter instead of always using "today"
 * because when the cron processes overdue plans, the base date
 * should be the plan's current prochaineExecution, not today.
 */
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

/**
 * Generates a preventive OT from a maintenance plan.
 *
 * This is the core function. Here's the flow:
 *
 * 1. Fetch the plan → validate it exists and is active
 * 2. Create the OT → with a temporary number (we need the auto-ID first)
 * 3. Fix the OT number → now we have the ID, format it as "OT-000012"
 * 4. Advance the plan → set dernierExecution to now, calculate next date
 * 5. Return the OT → so the caller can log it or return it in a response
 *
 * Why do we throw errors instead of returning null?
 * Because Express controllers use try/catch + next(error).
 * Throwing lets the error bubble up naturally to the error handler.
 * The cron wraps each call in its own try/catch to keep processing.
 */
export async function generateOTFromPlan(planId: number) {
  // ── Step 1: Fetch and validate ──────────────────────────
  // We fetch the plan fresh every time (not passed as argument)
  // because the caller shouldn't need to worry about stale data.
  // The service owns the data access — single responsibility.
  const plan = await prisma.planMaintenance.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new Error('Plan de maintenance introuvable');
  }

  if (!plan.actif) {
    throw new Error('Ce plan de maintenance est inactif');
  }

  // ── Step 2: Create the OT ──────────────────────────────
  // Why "TEMP-" + Date.now()? Because numeroOT is @unique in the schema.
  // We can't know the auto-incremented ID before the row exists,
  // but we need a unique placeholder to satisfy the constraint.
  // Date.now() + random gives us collision-safe uniqueness.
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

  // ── Step 3: Fix the OT number ──────────────────────────
  // Now we have ot.id (e.g., 12), so we format it as "OT-000012".
  // padStart(6, '0') ensures consistent 6-digit formatting.
  // This two-step create-then-update is a common pattern when
  // the display ID depends on the database-generated ID.
  const updatedOT = await prisma.ordreTravail.update({
    where: { id: ot.id },
    data: { numeroOT: 'OT-' + ot.id.toString().padStart(6, '0') },
  });

  // ── Step 4: Advance the plan schedule ──────────────────
  // Calculate the next execution based on the plan's frequency.
  // We use prochaineExecution as the base (not today) so the schedule
  // stays anchored. Example: if a monthly plan was due July 1st
  // but the cron ran July 2nd, the next date should be August 1st,
  // not August 2nd. This prevents schedule drift.
  const nextDate = calculateNextExecution(plan.prochaineExecution || today, plan.frequence);

  await prisma.planMaintenance.update({
    where: { id: plan.id },
    data: {
      dernierExecution: new Date(),
      prochaineExecution: nextDate,
    },
  });

  // ── Step 5: Return the created OT ─────────────────────
  // The cron uses this for logging. The controller uses this
  // to send back in the HTTP response.
  return updatedOT;
}
