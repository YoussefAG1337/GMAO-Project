import { z } from 'zod';

export const createOtSchema = z.object({
  atelierId: z.number().min(1, "L'atelier est requis"),
  ligneId: z.number().min(1, "La ligne est requise"),
  posteId: z.number().min(1, "Le poste est requis"),
  description: z.string().min(1, 'La description est requise'),
  priorite: z.enum(['BASSE', 'MOYENNE', 'HAUTE', 'CRITIQUE']),
  typeMaintenance: z.enum(['PREVENTIVE', 'CURATIVE', 'CORRECTIVE', 'AMELIORATIVE']),
  datePrevue: z.string().optional(),
  technicienId: z.number().optional(),
});

export type CreateOtFormData = z.infer<typeof createOtSchema>;

export const updateOtSchema = z.object({
  description: z.string().min(1, 'La description est requise').optional(),
  priorite: z.enum(['BASSE', 'MOYENNE', 'HAUTE', 'CRITIQUE']).optional(),
  datePrevue: z.string().optional().or(z.literal('')),
  technicienId: z.number().optional(),
});

export type UpdateOtFormData = z.infer<typeof updateOtSchema>;

export const submitRapportSchema = z.object({
  diagnostic: z.string().min(1, 'Le diagnostic est requis'),
  causePanne: z.string().optional(), // mapped from description
  actionsRealisees: z.string().min(1, 'Les actions réalisées sont requises'),
  tempsIntervention: z.number().min(1, "Le temps d'intervention doit être d'au moins 1 minute"),
  tempsArret: z.number().min(0).optional().nullable(),
  piecesUtilisees: z.array(
    z.object({
      pieceId: z.number().min(1, "La pièce est requise"),
      quantite: z.number().min(1, "La quantité doit être au moins de 1"),
    })
  ).optional(),
  commentaires: z.string().optional(),
});

export type SubmitRapportFormData = z.infer<typeof submitRapportSchema>;
