import { api } from '@/lib/api';
import { ApiResponse } from '@/types/api.types';
import {
  Atelier,
  Ligne,
  Poste,
  CreateAtelierDto,
  UpdateAtelierDto,
  CreateLigneDto,
  UpdateLigneDto,
  CreatePosteDto,
  UpdatePosteDto,
} from '@/types/equipement.types';

export const equipementService = {
  keys: {
    ateliers: '/equipements/ateliers',
    lignes: '/equipements/lignes',
    postes: '/equipements/postes',
  },

  ateliers: {
    getAll: () =>
      api.get<ApiResponse<{ ateliers: Atelier[] } | Atelier[]>>('/equipements/ateliers').then((res) => {
        const data = res.data;
        return (data && 'ateliers' in data && Array.isArray(data.ateliers)) ? data.ateliers : (data as Atelier[]);
      }),
    create: (data: CreateAtelierDto) =>
      api.post<ApiResponse<Atelier>>('/equipements/ateliers', data).then((res) => res.data),
    update: (id: number, data: UpdateAtelierDto) =>
      api.put<ApiResponse<Atelier>>(`/equipements/ateliers/${id}`, data).then((res) => res.data),
    delete: (id: number) =>
      api.delete<ApiResponse<void>>(`/equipements/ateliers/${id}`).then((res) => res.data),
    toggleActive: (id: number, actif: boolean) =>
      api.put<ApiResponse<Atelier>>(`/equipements/ateliers/${id}`, { actif }).then((res) => res.data),
  },

  lignes: {
    getAll: () =>
      api.get<ApiResponse<{ lignes: Ligne[] } | Ligne[]>>('/equipements/lignes').then((res) => {
        const data = res.data;
        return (data && 'lignes' in data && Array.isArray(data.lignes)) ? data.lignes : (data as Ligne[]);
      }),
    create: (data: CreateLigneDto) =>
      api.post<ApiResponse<Ligne>>('/equipements/lignes', data).then((res) => res.data),
    update: (id: number, data: UpdateLigneDto) =>
      api.put<ApiResponse<Ligne>>(`/equipements/lignes/${id}`, data).then((res) => res.data),
    delete: (id: number) =>
      api.delete<ApiResponse<void>>(`/equipements/lignes/${id}`).then((res) => res.data),
    toggleActive: (id: number, actif: boolean) =>
      api.put<ApiResponse<Ligne>>(`/equipements/lignes/${id}`, { actif }).then((res) => res.data),
  },

  postes: {
    getAll: () =>
      api.get<ApiResponse<{ postes: Poste[] } | Poste[]>>('/equipements/postes').then((res) => {
        const data = res.data;
        return (data && 'postes' in data && Array.isArray(data.postes)) ? data.postes : (data as Poste[]);
      }),
    create: (data: CreatePosteDto) =>
      api.post<ApiResponse<Poste>>('/equipements/postes', data).then((res) => res.data),
    update: (id: number, data: UpdatePosteDto) =>
      api.put<ApiResponse<Poste>>(`/equipements/postes/${id}`, data).then((res) => res.data),
    delete: (id: number) =>
      api.delete<ApiResponse<void>>(`/equipements/postes/${id}`).then((res) => res.data),
    toggleActive: (id: number, actif: boolean) =>
      api.put<ApiResponse<Poste>>(`/equipements/postes/${id}`, { actif }).then((res) => res.data),
  },
};
