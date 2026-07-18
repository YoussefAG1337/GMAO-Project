import { Atelier, Ligne, Poste } from './equipement.types';
import { User } from './index';
import { Di } from './di.types';

export type StatutOT =
  | 'CREE'
  | 'ASSIGNE'
  | 'EN_COURS'
  | 'REPORTE'
  | 'RAPPORTE'
  | 'EN_ATTENTE_VALIDATION'
  | 'NON_VALIDE'
  | 'ANNULE'
  | 'FERME';

export interface Ot {
  id: number;
  numeroOT: string;
  statut: StatutOT;
  typeMaintenance: 'PREVENTIVE' | 'CURATIVE';
  priorite: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
  description: string;
  datePrevue?: string;
  dateDebutPrevue?: string;
  dateFinPrevue?: string;
  dateDebutReelle?: string;
  dateFinReelle?: string;
  dateDebut?: string;
  dateFin?: string;
  technicienId?: number;
  atelierId?: number;
  ligneId?: number;
  posteId?: number;
  panneId?: number;
  produitId?: number;
  diId?: number;
  planId?: number;
  raisonReport?: string;
  raisonAnnulation?: string;
  raisonNonValidation?: string;
  createdAt: string;
  updatedAt: string;

  atelier?: Atelier;
  ligne?: Ligne;
  poste?: Poste;
  technicien?: User;
  demandeIntervention?: Di;
  rapportIntervention?: any;
}

export interface CreateOtDto {
  atelierId?: number | string;
  ligneId?: number | string;
  posteId?: number | string;
  description: string;
  priorite: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
  typeMaintenance: 'PREVENTIVE' | 'CURATIVE' | 'CORRECTIVE' | 'AMELIORATIVE';
  datePrevue?: string;
  technicienId?: string | number;
}

export interface UpdateOtDto {
  description?: string;
  priorite?: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
  datePrevue?: string;
  technicienId?: number | string;
}

export interface AssignOtDto {
  technicienId: number;
}

export interface SubmitRapportDto {
  diagnostic: string;
  causePanne: string;
  actionsRealisees: string;
  tempsIntervention: number;
  tempsArret?: number;
  piecesUtilisees?: { pieceId: number; quantite: number }[];
  commentaires: string;
}

export interface RaisonDto {
  raison: string;
}
