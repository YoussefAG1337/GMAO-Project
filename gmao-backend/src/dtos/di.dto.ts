import { z } from 'zod';
import { Priorite } from '@prisma/client';

export const createDISchema = z.object({
  body: z.object({
    description: z.string().min(5, 'La description doit contenir au moins 5 caractères'),
    atelierId: z.number().int().positive(),
    ligneId: z.number().int().positive(),
    posteId: z.number().int().positive(),
    produit: z.string().optional(),
    referenceProduit: z.string().optional(),
    familleProduit: z.string().optional(),
    priorite: z.nativeEnum(Priorite).optional(),
  }),
});

export const updateDISchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "L'ID doit être un nombre"),
  }),
  body: z.object({
    description: z.string().min(5).optional(),
    atelierId: z.number().int().positive().optional(),
    ligneId: z.number().int().positive().optional(),
    posteId: z.number().int().positive().optional(),
    produit: z.string().optional(),
    referenceProduit: z.string().optional(),
    familleProduit: z.string().optional(),
    priorite: z.nativeEnum(Priorite).optional(),
  }),
});

export type CreateDIDTO = z.infer<typeof createDISchema>['body'];
export type UpdateDIDTO = z.infer<typeof updateDISchema>['body'];
