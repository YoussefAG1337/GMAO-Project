import { z } from 'zod';
import { Role } from '@prisma/client';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide'),
    motDePasse: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
    role: z.nativeEnum(Role),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "L'ID doit être un nombre"),
  }),
  body: z.object({
    email: z.string().email('Email invalide').optional(),
    nom: z.string().min(2).optional(),
    prenom: z.string().min(2).optional(),
    role: z.nativeEnum(Role).optional(),
    actif: z.boolean().optional(),
  }),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>['body'];
export type UpdateUserDTO = z.infer<typeof updateUserSchema>['body'];
