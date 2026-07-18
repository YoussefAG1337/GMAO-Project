export interface FamilleProduit {
  id: number;
  nom: string;
  createdAt: string;
  updatedAt: string;
}

export interface Produit {
  id: number;
  nom: string;
  familleProduitId: number;
  famille?: FamilleProduit;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFamilleDto {
  nom: string;
}

export interface UpdateFamilleDto {
  nom?: string;
}

export interface CreateProduitDto {
  nom: string;
  familleProduitId: number;
}

export interface UpdateProduitDto {
  nom?: string;
  familleProduitId?: number;
}
