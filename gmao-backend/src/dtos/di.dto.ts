import { z } from 'zod';
import { Priorite } from '@prisma/client';

export const createDISchema = z.object({
  body: z.object({
    atelierId: z.coerce.number().int().positive(),
    ligneId: z.coerce.number().int().positive(),
    posteId: z.coerce.number().int().positive(),
    produitId: z.coerce.number().int().positive().optional(),
    panneId: z.coerce.number().int().positive().optional(),
    nouvellePanneNom: z.string().optional(),
    priorite: z.nativeEnum(Priorite).optional(),
  }),
});

export const updateDISchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "L'ID doit être un nombre"),
  }),
  body: z.object({
    atelierId: z.coerce.number().int().positive().optional(),
    ligneId: z.coerce.number().int().positive().optional(),
    posteId: z.coerce.number().int().positive().optional(),
    produitId: z.coerce.number().int().positive().optional(),
    panneId: z.coerce.number().int().positive().optional(),
    nouvellePanneNom: z.string().optional(),
    priorite: z.nativeEnum(Priorite).optional(),
  }),
});

export type CreateDIDTO = z.infer<typeof createDISchema>['body'];
export type UpdateDIDTO = z.infer<typeof updateDISchema>['body'];
