export interface Plan {
  id: number;
  intitule: string;
  description?: string;
  atelierId: number;
  ligneId: number;
  posteId: number;
  frequence: 'HEBDOMADAIRE' | 'MENSUELLE' | 'TRIMESTRIELLE' | 'SEMESTRIELLE' | 'ANNUELLE';
  prochaineExecution: string;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanDto {
  intitule: string;
  description?: string;
  atelierId: number;
  ligneId: number;
  posteId: number;
  frequence: 'HEBDOMADAIRE' | 'MENSUELLE' | 'TRIMESTRIELLE' | 'SEMESTRIELLE' | 'ANNUELLE';
  prochaineExecution: string;
}

export interface UpdatePlanDto {
  intitule?: string;
  description?: string;
  atelierId?: number;
  ligneId?: number;
  posteId?: number;
  frequence?: 'HEBDOMADAIRE' | 'MENSUELLE' | 'TRIMESTRIELLE' | 'SEMESTRIELLE' | 'ANNUELLE';
  prochaineExecution?: string;
  actif?: boolean;
}
