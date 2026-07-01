import { z } from 'zod';

export const createAtelierSchema = z.object({
  body: z.object({
    nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    description: z.string().optional(),
  }),
});

export const updateAtelierSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "L'ID doit être un nombre"),
  }),
  body: z.object({
    nom: z.string().min(2).optional(),
    description: z.string().optional(),
    actif: z.boolean().optional(),
  }),
});

export const createLigneSchema = z.object({
  body: z.object({
    nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    description: z.string().optional(),
    atelierId: z.number().int().positive(),
  }),
});

export const updateLigneSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "L'ID doit être un nombre"),
  }),
  body: z.object({
    nom: z.string().min(2).optional(),
    description: z.string().optional(),
    atelierId: z.number().int().positive().optional(),
    actif: z.boolean().optional(),
  }),
});

export const createPosteSchema = z.object({
  body: z.object({
    nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    description: z.string().optional(),
    ligneId: z.number().int().positive(),
  }),
});

export const updatePosteSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "L'ID doit être un nombre"),
  }),
  body: z.object({
    nom: z.string().min(2).optional(),
    description: z.string().optional(),
    ligneId: z.number().int().positive().optional(),
    actif: z.boolean().optional(),
  }),
});

export type CreateAtelierDTO = z.infer<typeof createAtelierSchema>['body'];
export type UpdateAtelierDTO = z.infer<typeof updateAtelierSchema>['body'];
export type CreateLigneDTO = z.infer<typeof createLigneSchema>['body'];
export type UpdateLigneDTO = z.infer<typeof updateLigneSchema>['body'];
export type CreatePosteDTO = z.infer<typeof createPosteSchema>['body'];
export type UpdatePosteDTO = z.infer<typeof updatePosteSchema>['body'];
