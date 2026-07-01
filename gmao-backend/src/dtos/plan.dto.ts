import { z } from 'zod';
import { FrequenceMaintenance } from '@prisma/client';

export const createPlanSchema = z.object({
  body: z.object({
    intitule: z.string().min(5, "L'intitulé doit contenir au moins 5 caractères"),
    description: z.string().optional(),
    atelierId: z.number().int().positive(),
    ligneId: z.number().int().positive(),
    posteId: z.number().int().positive(),
    frequence: z.nativeEnum(FrequenceMaintenance),
    prochaineExecution: z.string().datetime().optional().or(z.date().optional()),
  }),
});

export const updatePlanSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "L'ID doit être un nombre"),
  }),
  body: z.object({
    intitule: z.string().min(5).optional(),
    description: z.string().optional(),
    atelierId: z.number().int().positive().optional(),
    ligneId: z.number().int().positive().optional(),
    posteId: z.number().int().positive().optional(),
    frequence: z.nativeEnum(FrequenceMaintenance).optional(),
    prochaineExecution: z.string().datetime().optional().or(z.date().optional()),
    actif: z.boolean().optional(),
  }),
});

export type CreatePlanDTO = z.infer<typeof createPlanSchema>['body'];
export type UpdatePlanDTO = z.infer<typeof updatePlanSchema>['body'];
