import { api } from '@/lib/api';
import {
  CreateOtDto,
  UpdateOtDto,
  AssignOtDto,
  SubmitRapportDto,
  RaisonDto,
  Ot,
} from '@/types/ot.types';
import { ApiResponse } from '@/types/api.types';

export const otService = {
  keys: {
    all: '/ots',
    detail: (id: number) => `/ots/${id}`,
  },

  getAll: () =>
    api.get<ApiResponse<{ ots: Ot[] } | Ot[]>>('/ots').then((res) => {
      const data = res.data;
      return data && 'ots' in data && Array.isArray(data.ots) ? data.ots : (data as Ot[]);
    }),

  create: (data: CreateOtDto) => api.post<ApiResponse<Ot>>('/ots', data).then((res) => res.data),

  update: (id: number, data: UpdateOtDto) =>
    api.put<ApiResponse<Ot>>(`/ots/${id}`, data).then((res) => res.data),

  assign: (id: number, data: AssignOtDto) =>
    api.patch<ApiResponse<Ot>>(`/ots/${id}/assign`, data).then((res) => res.data),

  delete: (id: number) => api.delete<ApiResponse<void>>(`/ots/${id}`).then((res) => res.data),

  start: (id: number) => api.patch<ApiResponse<Ot>>(`/ots/${id}/start`).then((res) => res.data),

  submitRapport: (id: number, data: SubmitRapportDto) =>
    api.post<ApiResponse<any>>(`/ots/${id}/rapport`, data).then((res) => res.data),

  /** Technicien valide son propre travail → EN_ATTENTE_VALIDATION */
  validerTechnicien: (id: number) =>
    api.patch<ApiResponse<Ot>>(`/ots/${id}/valider-technicien`).then((res) => res.data),

  /** Admin/Chef valide définitivement → FERME */
  validate: (id: number) =>
    api.patch<ApiResponse<Ot>>(`/ots/${id}/validate`).then((res) => res.data),

  /** Technicien reporte l'intervention → REPORTE */
  reporter: (id: number, data: RaisonDto) =>
    api.patch<ApiResponse<Ot>>(`/ots/${id}/reporter`, data).then((res) => res.data),

  /** Technicien annule l'OT → ANNULE */
  annuler: (id: number, data: RaisonDto) =>
    api.patch<ApiResponse<Ot>>(`/ots/${id}/annuler`, data).then((res) => res.data),

  /** Technicien ou Admin/Chef rejette avec raison → NON_VALIDE */
  nonValider: (id: number, data: RaisonDto) =>
    api.patch<ApiResponse<Ot>>(`/ots/${id}/non-valide`, data).then((res) => res.data),
};
