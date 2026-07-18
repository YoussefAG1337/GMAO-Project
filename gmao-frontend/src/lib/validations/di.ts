import { z } from 'zod';

export const createDiSchema = z.object({
  atelierId: z.number().min(1, "L'atelier est requis"),
  ligneId: z.number().min(1, "La ligne est requise"),
  posteId: z.number().min(1, "Le poste est requis"),
  familleId: z.number().optional(),
  produitId: z.number().optional(),
  panneId: z.union([z.number(), z.literal('NOUVELLE'), z.nan()]).optional(),
  nouvellePanneNom: z.string().optional(),
  nouvellePanneType: z.enum(['TECHNIQUE', 'QUALITE']).optional(),
  technicienId: z.number().optional(),
  priorite: z.enum(['BASSE', 'MOYENNE', 'HAUTE', 'CRITIQUE']),
  document: z.any().optional(), // Géré séparément ou via RHF
}).refine((data) => {
  if (data.panneId === 'NOUVELLE' && (!data.nouvellePanneNom || data.nouvellePanneNom.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "Veuillez préciser le nom de la nouvelle panne",
  path: ["nouvellePanneNom"]
});

export type CreateDiFormData = z.infer<typeof createDiSchema>;

export const updateDiSchema = z.object({
  atelierId: z.number().min(1, "L'atelier est requis").optional(),
  ligneId: z.number().min(1, "La ligne est requise").optional(),
  posteId: z.number().min(1, "Le poste est requis").optional(),
  familleId: z.number().optional(),
  produitId: z.number().optional(),
  panneId: z.union([z.number(), z.literal('NOUVELLE'), z.nan()]).optional(),
  nouvellePanneNom: z.string().optional(),
  nouvellePanneType: z.enum(['TECHNIQUE', 'QUALITE']).optional(),
  technicienId: z.number().optional(),
  priorite: z.enum(['BASSE', 'MOYENNE', 'HAUTE', 'CRITIQUE']).optional(),
}).refine((data) => {
  if (data.panneId === 'NOUVELLE' && (!data.nouvellePanneNom || data.nouvellePanneNom.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "Veuillez préciser le nom de la nouvelle panne",
  path: ["nouvellePanneNom"]
});

export type UpdateDiFormData = z.infer<typeof updateDiSchema>;
