export type Role = 'ADMIN' | 'CHEF_MAINTENANCE' | 'CHEF_TECHNICIEN' | 'TECHNICIEN' | 'MAGASINIER';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  actif: boolean;
  dernierLogin: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  errors?: Array<{ field: string; message: string }>;
}

// ----------------------------------------------------
// ENUMS GMAO
// ----------------------------------------------------

export enum StatutDI {
  NOUVELLE = 'NOUVELLE',
  EN_COURS = 'EN_COURS',
  RESOLUE = 'RESOLUE',
  CLOTUREE = 'CLOTUREE',
}

export enum StatutOT {
  CREE = 'CREE',
  ASSIGNE = 'ASSIGNE',
  EN_COURS = 'EN_COURS',
  EN_ATTENTE_VALIDATION = 'EN_ATTENTE_VALIDATION',
  FERME = 'FERME',
}

export enum Priorite {
  BASSE = 'BASSE',
  MOYENNE = 'MOYENNE',
  HAUTE = 'HAUTE',
  CRITIQUE = 'CRITIQUE',
}

export enum TypeMaintenance {
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
  AMELIORATIVE = 'AMELIORATIVE',
}

export enum FrequenceMaintenance {
  HEBDOMADAIRE = 'HEBDOMADAIRE',
  MENSUELLE = 'MENSUELLE',
  TRIMESTRIELLE = 'TRIMESTRIELLE',
  SEMESTRIELLE = 'SEMESTRIELLE',
  ANNUELLE = 'ANNUELLE',
}

// ----------------------------------------------------
// INTERFACES EQUIPEMENTS
// ----------------------------------------------------

export interface Atelier {
  id: number;
  nom: string;
  description: string | null;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    lignes: number;
  };
}

export interface Ligne {
  id: number;
  nom: string;
  description: string | null;
  atelierId: number;
  atelier?: Atelier;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    postes: number;
  };
}

export interface Poste {
  id: number;
  nom: string;
  description: string | null;
  ligneId: number;
  ligne?: Ligne;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// INTERFACES DI & OT
// ----------------------------------------------------

export interface DemandeIntervention {
  id: number;
  numeroDI: string;
  atelierId: number;
  atelier?: Atelier;
  ligneId: number;
  ligne?: Ligne;
  posteId: number;
  poste?: Poste;
  produit: string | null;
  referenceProduit: string | null;
  familleProduit: string | null;
  description: string;
  priorite: Priorite;
  statut: StatutDI;
  declareParId: number;
  declarePar?: Partial<User>;
  dateDeclaration: string;
  updatedAt: string;
  ordresTravail?: OrdreTravail[];
}

export interface OrdreTravail {
  id: number;
  numeroOT: string;
  demandeInterventionId: number | null;
  demandeIntervention?: DemandeIntervention;
  planMaintenanceId: number | null;
  technicienId: number | null;
  technicien?: Partial<User>;
  valideParId: number | null;
  atelierId: number;
  atelier?: Atelier;
  ligneId: number;
  ligne?: Ligne;
  posteId: number;
  poste?: Poste;
  typeMaintenance: TypeMaintenance;
  statut: StatutOT;
  priorite: Priorite;
  description: string | null;
  datePrevue: string | null;
  dateDebut: string | null;
  dateFin: string | null;
  dateValidation: string | null;
  createdAt: string;
  updatedAt: string;
  rapportIntervention?: RapportIntervention;
}

export interface RapportIntervention {
  id: number;
  ordreTravailId: number;
  ordreTravail?: OrdreTravail;
  diagnostic: string;
  causePanne: string | null;
  actionsRealisees: string;
  tempsIntervention: number; // minutes
  tempsArret: number | null; // minutes
  piecesUtilisees: string | null;
  commentaires: string | null;
  redacteurId: number;
  redacteur?: Partial<User>;
  createdAt: string;
  updatedAt: string;
}

export interface PlanMaintenance {
  id: number;
  intitule: string;
  description: string | null;
  frequence: FrequenceMaintenance;
  atelierId: number;
  atelier?: Atelier;
  ligneId: number;
  ligne?: Ligne;
  posteId: number;
  poste?: Poste;
  actif: boolean;
  prochaineExecution: string | null;
  dernierExecution: string | null;
  creeParId: number;
  creePar?: Partial<User>;
  createdAt: string;
  updatedAt: string;
}
