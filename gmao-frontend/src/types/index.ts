export type Role = 'ADMIN' | 'CHEF_MAINTENANCE' | 'TECHNICIEN' | 'MAGASINIER';

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
