/**
 * @fileoverview Schémas de validation Zod pour les équipements
 * @description Validation des entrées utilisateur pour Atelier, Ligne, et Poste
 */

import { z } from 'zod';

const required = (msg: string) => ({
  error: (issue: any) => (issue.input === undefined ? msg : 'Format incorrect'),
});

// ==========================================
// ATELIER
// ==========================================

export const createAtelierSchema = z.object({
  nom: z
    .string(required('Le nom est requis'))
    .max(100, 'Le nom ne doit pas dépasser 100 caractères')
    .trim(),
  description: z.string().optional(),
});

export const updateAtelierSchema = z.object({
  nom: z.string().max(100, 'Le nom ne doit pas dépasser 100 caractères').trim().optional(),
  description: z.string().optional(),
  actif: z.boolean().optional(),
});

// ==========================================
// LIGNE
// ==========================================

export const createLigneSchema = z.object({
  nom: z
    .string(required('Le nom est requis'))
    .max(100, 'Le nom ne doit pas dépasser 100 caractères')
    .trim(),
  description: z.string().optional(),
  atelierId: z.number(required("L'ID de l'atelier est requis")).int().positive(),
});

export const updateLigneSchema = z.object({
  nom: z.string().max(100, 'Le nom ne doit pas dépasser 100 caractères').trim().optional(),
  description: z.string().optional(),
  atelierId: z.number().int().positive().optional(),
  actif: z.boolean().optional(),
});

// ==========================================
// POSTE
// ==========================================

export const createPosteSchema = z.object({
  nom: z
    .string(required('Le nom est requis'))
    .max(100, 'Le nom ne doit pas dépasser 100 caractères')
    .trim(),
  description: z.string().optional(),
  ligneId: z.number(required("L'ID de la ligne est requis")).int().positive(),
});

export const updatePosteSchema = z.object({
  nom: z.string().max(100, 'Le nom ne doit pas dépasser 100 caractères').trim().optional(),
  description: z.string().optional(),
  ligneId: z.number().int().positive().optional(),
  actif: z.boolean().optional(),
});

export type CreateAtelierInput = z.infer<typeof createAtelierSchema>;
export type UpdateAtelierInput = z.infer<typeof updateAtelierSchema>;
export type CreateLigneInput = z.infer<typeof createLigneSchema>;
export type UpdateLigneInput = z.infer<typeof updateLigneSchema>;
export type CreatePosteInput = z.infer<typeof createPosteSchema>;
export type UpdatePosteInput = z.infer<typeof updatePosteSchema>;
