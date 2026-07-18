import { Atelier, Ligne, Poste } from './index';

export type { Atelier, Ligne, Poste };

export interface CreateAtelierDto {
  nom: string;
  description: string;
}

export interface UpdateAtelierDto {
  nom?: string;
  description?: string;
  actif?: boolean;
}

export interface CreateLigneDto {
  nom: string;
  description: string;
  atelierId: number;
  technicienIds?: number[];
}

export interface UpdateLigneDto {
  nom?: string;
  description?: string;
  atelierId?: number;
  technicienIds?: number[];
  actif?: boolean;
}

export interface CreatePosteDto {
  nom: string;
  description: string;
  ligneId: number;
}

export interface UpdatePosteDto {
  nom?: string;
  description?: string;
  ligneId?: number;
  actif?: boolean;
}
