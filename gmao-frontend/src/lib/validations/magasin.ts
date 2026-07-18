import { z } from 'zod';

export const pieceSchema = z.object({
  code: z.string().min(2, 'Le code doit contenir au moins 2 caractères'),
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  seuilAlerte: z.number().min(0, 'Le seuil doit être positif'),
  prixUnitaire: z.number().min(0, 'Le prix doit être positif'),
});

export type PieceFormData = z.infer<typeof pieceSchema>;

export const mouvementSchema = z
  .object({
    pieceId: z.number().min(1, 'Pièce invalide'),
    type: z.enum(['ENTREE', 'SORTIE']),
    quantite: z.number().min(1, 'La quantité doit être au moins 1'),
    referenceOT: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'SORTIE' && !data.referenceOT) {
        // We can make referenceOT mandatory for SORTIE if needed,
        // but the original code had it optional.
        return true;
      }
      return true;
    },
    {
      message: 'Référence OT requise pour une sortie',
      path: ['referenceOT'],
    },
  );

export type MouvementFormData = z.infer<typeof mouvementSchema>;
