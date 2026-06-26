/**
 * @fileoverview Schémas de validation Zod pour l'authentification
 * @description Validation des entrées utilisateur avec messages d'erreur en français.
 */

import { z } from 'zod';

/** Expression régulière pour la complexité du mot de passe */
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_.])[A-Za-z\d@$!%*?&#+\-_.]{8,}$/;

/** Message descriptif pour les exigences du mot de passe */
const passwordMessage =
  'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&#+_-.)';

/**
 * Schéma de validation pour la connexion
 */
/** Helper pour gérer les champs requis sous Zod v4 */
const required = (msg: string) => ({
  error: (issue: any) => (issue.input === undefined ? msg : 'Format incorrect'),
});

export const loginSchema = z.object({
  email: z
    .string(required("L'adresse email est requise"))
    .email("L'adresse email n'est pas valide")
    .max(255, "L'adresse email ne doit pas dépasser 255 caractères")
    .transform((val) => val.toLowerCase().trim()),
  motDePasse: z.string(required('Le mot de passe est requis')).min(1, 'Le mot de passe est requis'),
});

/**
 * Schéma de validation pour l'inscription d'un nouvel utilisateur
 */
export const registerSchema = z.object({
  nom: z
    .string(required('Le nom est requis'))
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères')
    .trim(),
  prenom: z
    .string(required('Le prénom est requis'))
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(100, 'Le prénom ne doit pas dépasser 100 caractères')
    .trim(),
  email: z
    .string(required("L'adresse email est requise"))
    .email("L'adresse email n'est pas valide")
    .max(255, "L'adresse email ne doit pas dépasser 255 caractères")
    .transform((val) => val.toLowerCase().trim()),
  motDePasse: z
    .string(required('Le mot de passe est requis'))
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(passwordRegex, passwordMessage),
  role: z.enum(['ADMIN', 'CHEF_MAINTENANCE', 'TECHNICIEN', 'MAGASINIER'], {
    error: (issue: any) =>
      issue.input === undefined
        ? 'Le rôle est requis'
        : 'Le rôle doit être ADMIN, CHEF_MAINTENANCE, TECHNICIEN ou MAGASINIER',
  }),
});

export const signupSchema = z.object({
  nom: z
    .string(required('Le nom est requis'))
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères')
    .trim(),
  prenom: z
    .string(required('Le prénom est requis'))
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(100, 'Le prénom ne doit pas dépasser 100 caractères')
    .trim(),
  email: z
    .string(required("L'adresse email est requise"))
    .email("L'adresse email n'est pas valide")
    .max(255, "L'adresse email ne doit pas dépasser 255 caractères")
    .transform((val) => val.toLowerCase().trim()),
  motDePasse: z
    .string(required('Le mot de passe est requis'))
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(passwordRegex, passwordMessage),
});

/**
 * Schéma de validation pour le changement de mot de passe
 */
export const changePasswordSchema = z.object({
  ancienMotDePasse: z
    .string(required("L'ancien mot de passe est requis"))
    .min(1, "L'ancien mot de passe est requis"),
  nouveauMotDePasse: z
    .string(required('Le nouveau mot de passe est requis'))
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .regex(passwordRegex, passwordMessage),
});

/** Types inférés depuis les schémas Zod */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
