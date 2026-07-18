import { z } from 'zod';

// Shared: nom + description apply to all equipment types
const baseEquipementSchema = {
  nom: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
};

// Atelier: only nom + description
export const atelierSchema = z.object({
  ...baseEquipementSchema,
});

// Ligne: needs an atelier parent + optional techniciens
export const ligneSchema = z.object({
  ...baseEquipementSchema,
  atelierId: z.number().min(1, "L'atelier parent est requis"),
  technicienIds: z.array(z.number()).optional(),
});

// Poste: needs a ligne parent
export const posteSchema = z.object({
  ...baseEquipementSchema,
  ligneId: z.number().min(1, 'La ligne parente est requise'),
});

export type AtelierFormData = z.infer<typeof atelierSchema>;
export type LigneFormData = z.infer<typeof ligneSchema>;
export type PosteFormData = z.infer<typeof posteSchema>;
