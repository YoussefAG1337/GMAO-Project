/**
 * @fileoverview Schémas de validation Zod pour la gestion des utilisateurs
 */

import { z } from 'zod';
import { Role } from '@prisma/client';

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_.])[A-Za-z\d@$!%*?&#+\-_.]{8,}$/;
const passwordMessage =
  'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&#+_-.)';

const required = (msg: string) => ({
  error: (issue: any) => (issue.input === undefined ? msg : 'Format incorrect'),
});

export const createUserSchema = z.object({
  nom: z.string(required('Le nom est requis')).min(2).max(100).trim(),
  prenom: z.string(required('Le prénom est requis')).min(2).max(100).trim(),
  email: z
    .string(required("L'email est requis"))
    .email()
    .max(255)
    .transform((val) => val.toLowerCase().trim()),
  motDePasse: z
    .string(required('Le mot de passe est requis'))
    .min(8)
    .regex(passwordRegex, passwordMessage),
  role: z.nativeEnum(Role, required('Le rôle est requis')),
});

export const updateUserSchema = z.object({
  nom: z.string().min(2).max(100).trim().optional(),
  prenom: z.string().min(2).max(100).trim().optional(),
  email: z
    .string()
    .email()
    .max(255)
    .transform((val) => val.toLowerCase().trim())
    .optional(),
  role: z.nativeEnum(Role).optional(),
  actif: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
