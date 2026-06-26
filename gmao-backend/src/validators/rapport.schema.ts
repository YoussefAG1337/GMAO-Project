/**
 * @fileoverview Schémas de validation Zod pour les Rapports d'Intervention
 */

import { z } from 'zod';

const required = (msg: string) => ({
  error: (issue: any) => (issue.input === undefined ? msg : 'Format incorrect'),
});

export const createRapportSchema = z.object({
  diagnostic: z
    .string(required('Le diagnostic est requis'))
    .min(10, 'Le diagnostic doit contenir au moins 10 caractères'),
  causePanne: z.string().optional(),
  actionsRealisees: z
    .string(required('Les actions réalisées sont requises'))
    .min(10, 'Les actions réalisées doivent contenir au moins 10 caractères'),
  tempsIntervention: z.number(required("Le temps d'intervention est requis")).int().positive(),
  tempsArret: z.number().int().nonnegative().optional(),
  piecesUtilisees: z.string().optional(),
  commentaires: z.string().optional(),
});

export type CreateRapportInput = z.infer<typeof createRapportSchema>;
