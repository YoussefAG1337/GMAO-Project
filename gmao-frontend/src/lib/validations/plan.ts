import { z } from 'zod';

export const planSchema = z.object({
  intitule: z.string().min(1, "L'intitulé est requis"),
  description: z.string().optional(),
  atelierId: z.number().min(1, "L'atelier est requis"),
  ligneId: z.number().min(1, 'La ligne est requise'),
  posteId: z.number().min(1, "L'équipement cible est requis"),
  frequence: z.enum(['HEBDOMADAIRE', 'MENSUELLE', 'TRIMESTRIELLE', 'SEMESTRIELLE', 'ANNUELLE']),
  prochaineExecution: z.string().min(1, "La date d'exécution est requise"),
});

export type PlanFormData = z.infer<typeof planSchema>;
