import { api } from '@/lib/api';
import { ApiResponse } from '@/types/api.types';
import { Panne, CreatePanneDto, UpdatePanneDto } from '@/types/panne.types';

export const panneService = {
  keys: {
    all: (ligneId?: number | null, posteId?: number | null) => {
      if (!ligneId && !posteId) return null;
      const params = new URLSearchParams();
      if (ligneId) params.append('ligneId', ligneId.toString());
      if (posteId) params.append('posteId', posteId.toString());
      return `/pannes?${params.toString()}`;
    },
  },

  getAll: (ligneId?: number | null, posteId?: number | null) => {
    const params = new URLSearchParams();
    if (ligneId) params.append('ligneId', ligneId.toString());
    if (posteId) params.append('posteId', posteId.toString());
    return api.get<ApiResponse<Panne[]>>(`/pannes?${params.toString()}`).then((res) => {
      // Fallback if data is directly returned or wrapped in data
      return (res.data as any).data ? (res.data as any).data : res.data;
    });
  },

  create: (data: CreatePanneDto) =>
    api.post<ApiResponse<Panne>>('/pannes', data).then((res) => res.data),

  update: (id: number, data: UpdatePanneDto) =>
    api.put<ApiResponse<Panne>>(`/pannes/${id}`, data).then((res) => res.data),

  delete: (id: number) => api.delete<ApiResponse<void>>(`/pannes/${id}`).then((res) => res.data),
};
