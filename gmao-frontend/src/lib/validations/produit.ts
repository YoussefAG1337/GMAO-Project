import { z } from 'zod';

export const familleSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
});

export type FamilleFormData = z.infer<typeof familleSchema>;

export const produitSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  familleProduitId: z.number().min(1, 'Veuillez sélectionner une famille'),
});

export type ProduitFormData = z.infer<typeof produitSchema>;
