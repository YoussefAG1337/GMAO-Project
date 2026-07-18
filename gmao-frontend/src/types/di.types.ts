import { Atelier, Ligne, Poste } from './equipement.types';
import { Panne } from './panne.types';
import { Produit } from './produit.types';
import { User } from './index';

export interface Di {
  id: number;
  numeroDI: string;
  statut: 'NOUVELLE' | 'EN_COURS' | 'RESOLUE' | 'CLOTUREE';
  priorite: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
  atelierId: number;
  ligneId: number;
  posteId: number;
  panneId?: number;
  produitId?: number;
  nouvellePanneNom?: string;
  documentUtileUrl?: string;
  dateDeclaration: string;
  createdAt: string;
  updatedAt: string;
  technicienId?: number;
  declareParId?: number;
  // Relationships
  atelier?: Atelier;
  ligne?: Ligne;
  poste?: Poste;
  panne?: Panne;
  produit?: Produit;
  technicien?: User;
  declarePar?: User;
}

export interface UpdateDiDto {
  atelierId?: string;
  ligneId?: string;
  posteId?: string;
  familleId?: string;
  produitId?: string;
  panneId?: string;
  nouvellePanneNom?: string;
  priorite?: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
}

export interface CreateDiDto {
  atelierId: string;
  ligneId: string;
  posteId: string;
  familleId?: string;
  produitId?: string;
  panneId?: string;
  nouvellePanneNom?: string;
  priorite: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
  document?: File | null;
}
