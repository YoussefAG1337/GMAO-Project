export interface Piece {
  id: number;
  code: string;
  nom: string;
  description?: string;
  quantiteStock: number;
  seuilAlerte: number;
  prixUnitaire: number;
  createdAt: string;
  updatedAt: string;
}

export interface Mouvement {
  id: number;
  pieceId: number;
  type: 'ENTREE' | 'SORTIE';
  quantite: number;
  referenceOT?: string;
  dateMouvement: string;
  userId: number;
}

export interface CreatePieceDto {
  code: string;
  nom: string;
  description?: string;
  seuilAlerte: number;
  prixUnitaire: number;
}

export interface UpdatePieceDto {
  code?: string;
  nom?: string;
  description?: string;
  seuilAlerte?: number;
  prixUnitaire?: number;
}

export interface CreateMouvementDto {
  pieceId: number;
  type: 'ENTREE' | 'SORTIE';
  quantite: number;
  referenceOT?: string;
}
