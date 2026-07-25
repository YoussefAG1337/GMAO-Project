import { api } from '@/lib/api';
import {
  CreateOtDto,
  UpdateOtDto,
  AssignOtDto,
  SubmitRapportDto,
  RaisonDto,
  Ot,
} from '@/types/ot.types';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';
import { buildListQuery, ListParams } from '@/lib/pagination';

export const otService = {
  keys: {
    list: (params: ListParams = {}) => `/ots?${buildListQuery(params)}`,
    detail: (id: number) => `/ots/${id}`,
  },

  list: (params: ListParams = {}) =>
    api
      .get<ApiResponse<PaginatedResponse<Ot>>>(`/ots?${buildListQuery(params)}`)
      .then((res) => res.data as PaginatedResponse<Ot>),

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
