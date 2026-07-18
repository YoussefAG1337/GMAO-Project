import { z } from 'zod';

export const utilisateurEditSchema = z.object({
  role: z.enum(['ADMIN', 'CHEF_MAINTENANCE', 'CHEF_TECHNICIEN', 'TECHNICIEN', 'MAGASINIER']),
  actif: z.boolean(),
  lignes: z.array(z.number()).optional(),
});

export type UtilisateurEditFormData = z.infer<typeof utilisateurEditSchema>;
