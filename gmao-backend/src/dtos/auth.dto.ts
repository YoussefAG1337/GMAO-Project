import { z } from 'zod';
import { Role } from '@prisma/client';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide'),
    motDePasse: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide'),
    motDePasse: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
    role: z.nativeEnum(Role).optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    ancienMotDePasse: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    nouveauMotDePasse: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  }),
});

export type LoginDTO = z.infer<typeof loginSchema>['body'];
export type RegisterDTO = z.infer<typeof registerSchema>['body'];
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>['body'];
