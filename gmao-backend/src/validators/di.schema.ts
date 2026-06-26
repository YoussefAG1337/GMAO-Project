/**
 * @fileoverview Schémas de validation Zod pour les Demandes d'Intervention
 */

import { z } from 'zod';
import { Priorite, StatutDI } from '@prisma/client';

const required = (msg: string) => ({
  error: (issue: any) => (issue.input === undefined ? msg : 'Format incorrect'),
});

export const createDISchema = z.object({
  atelierId: z.number(required("L'ID de l'atelier est requis")).int().positive(),
  ligneId: z.number(required("L'ID de la ligne est requis")).int().positive(),
  posteId: z.number(required("L'ID du poste est requis")).int().positive(),
  produit: z.string().max(200).optional(),
  referenceProduit: z.string().max(100).optional(),
  familleProduit: z.string().max(100).optional(),
  description: z
    .string(required('La description est requise'))
    .min(10, 'La description doit contenir au moins 10 caractères'),
  priorite: z.nativeEnum(Priorite).optional().default(Priorite.MOYENNE),
});

export const updateDISchema = z.object({
  description: z.string().min(10).optional(),
  priorite: z.nativeEnum(Priorite).optional(),
  statut: z.nativeEnum(StatutDI).optional(),
  produit: z.string().max(200).optional(),
  referenceProduit: z.string().max(100).optional(),
  familleProduit: z.string().max(100).optional(),
});

export type CreateDIInput = z.infer<typeof createDISchema>;
export type UpdateDIInput = z.infer<typeof updateDISchema>;
