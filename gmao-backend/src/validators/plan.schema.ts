/**
 * @fileoverview Schémas de validation Zod pour les Plans de Maintenance Préventive
 */

import { z } from 'zod';
import { FrequenceMaintenance } from '@prisma/client';

const required = (msg: string) => ({
  error: (issue: any) => (issue.input === undefined ? msg : 'Format incorrect'),
});

export const createPlanSchema = z.object({
  intitule: z.string(required("L'intitulé est requis")).max(200).trim(),
  description: z.string().optional(),
  atelierId: z.number(required("L'ID de l'atelier est requis")).int().positive(),
  ligneId: z.number(required("L'ID de la ligne est requis")).int().positive(),
  posteId: z.number(required("L'ID du poste est requis")).int().positive(),
  frequence: z.nativeEnum(FrequenceMaintenance, required('La fréquence est requise')),
  prochaineExecution: z.string().optional(),
});

export const updatePlanSchema = z.object({
  intitule: z.string().max(200).trim().optional(),
  description: z.string().optional(),
  frequence: z.nativeEnum(FrequenceMaintenance).optional(),
  actif: z.boolean().optional(),
  prochaineExecution: z.string().optional(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
