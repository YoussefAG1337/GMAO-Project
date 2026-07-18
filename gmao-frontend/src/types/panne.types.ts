import { Ligne, Poste } from './equipement.types';

export interface Panne {
  id: number;
  nom: string;
  type: 'TECHNIQUE' | 'QUALITE';
  ligneId: number | null;
  ligne?: Ligne;
  posteId: number | null;
  poste?: Poste;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePanneDto {
  nom: string;
  type?: 'TECHNIQUE' | 'QUALITE';
  ligneId?: number;
  posteId?: number;
}

export interface UpdatePanneDto {
  nom?: string;
  type?: 'TECHNIQUE' | 'QUALITE';
}
