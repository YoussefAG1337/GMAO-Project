/**
 * @fileoverview Schémas de validation Zod pour les Ordres de Travail (OT)
 */

import { z } from 'zod';
import { Priorite, TypeMaintenance } from '@prisma/client';

const required = (msg: string) => ({
  error: (issue: any) => (issue.input === undefined ? msg : 'Format incorrect'),
});

export const createOTSchema = z.object({
  demandeInterventionId: z.number().int().positive().optional(),
  technicienId: z.number().int().positive().optional(),
  atelierId: z.number(required("L'ID de l'atelier est requis")).int().positive(),
  ligneId: z.number(required("L'ID de la ligne est requis")).int().positive(),
  posteId: z.number(required("L'ID du poste est requis")).int().positive(),
  datePrevue: z.string().optional(),
  priorite: z.nativeEnum(Priorite).optional(),
  typeMaintenance: z.nativeEnum(TypeMaintenance).optional().default(TypeMaintenance.CORRECTIVE),
  description: z.string().optional(),
});

export const updateOTSchema = z.object({
  technicienId: z.number().int().positive().optional(),
  datePrevue: z.string().optional(),
  priorite: z.nativeEnum(Priorite).optional(),
  description: z.string().optional(),
});

export const assignOTSchema = z.object({
  technicienId: z.number(required("L'ID du technicien est requis")).int().positive(),
});

export const validateOTSchema = z.object({});

export type CreateOTInput = z.infer<typeof createOTSchema>;
export type UpdateOTInput = z.infer<typeof updateOTSchema>;
export type AssignOTInput = z.infer<typeof assignOTSchema>;
