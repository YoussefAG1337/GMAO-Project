import { z } from 'zod';
import { TypeMaintenance, Priorite } from '@prisma/client';

export const createOTSchema = z.object({
  body: z.object({
    demandeInterventionId: z.number().int().positive().optional(),
    technicienId: z.number().int().positive().optional(),
    atelierId: z.number().int().positive(),
    ligneId: z.number().int().positive(),
    posteId: z.number().int().positive(),
    datePrevue: z.string().datetime().optional().or(z.date().optional()),
    priorite: z.nativeEnum(Priorite).optional(),
    typeMaintenance: z.nativeEnum(TypeMaintenance).optional(),
    description: z.string().min(5).optional(),
  }),
});

export const updateOTSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "L'ID doit être un nombre"),
  }),
  body: z.object({
    technicienId: z.number().int().positive().optional(),
    datePrevue: z.string().datetime().optional().or(z.date().optional()),
    priorite: z.nativeEnum(Priorite).optional(),
    typeMaintenance: z.nativeEnum(TypeMaintenance).optional(),
    description: z.string().min(5).optional(),
  }),
});

export const assignOTSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "L'ID doit être un nombre"),
  }),
  body: z.object({
    technicienId: z.number().int().positive(),
  }),
});

export const submitRapportSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "L'ID doit être un nombre"),
  }),
  body: z.object({
    diagnostic: z.string().min(5, 'Le diagnostic doit contenir au moins 5 caractères'),
    actionsRealisees: z
      .string()
      .min(5, 'Les actions réalisées doivent contenir au moins 5 caractères'),
    description: z.string().optional(),
    tempsIntervention: z.number().int().nonnegative("Le temps d'intervention doit être positif"),
    tempsArret: z.number().int().nonnegative("Le temps d'arrêt doit être positif").optional(),
    piecesChangees: z.string().optional(),
  }),
});

export type CreateOTDTO = z.infer<typeof createOTSchema>['body'];
export type UpdateOTDTO = z.infer<typeof updateOTSchema>['body'];
export type AssignOTDTO = z.infer<typeof assignOTSchema>['body'];
export type SubmitRapportDTO = z.infer<typeof submitRapportSchema>['body'];
