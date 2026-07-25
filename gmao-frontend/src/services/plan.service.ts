import { api } from '@/lib/api';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';
import { Plan, CreatePlanDto, UpdatePlanDto } from '@/types/plan.types';
import { Ot } from '@/types/ot.types';
import { buildListQuery, ListParams } from '@/lib/pagination';

export const planService = {
  keys: {
    list: (params: ListParams = {}) => `/plans?${buildListQuery(params)}`,
    detail: (id: number) => `/plans/${id}`,
  },

  list: (params: ListParams = {}) =>
    api
      .get<ApiResponse<PaginatedResponse<Plan>>>(`/plans?${buildListQuery(params)}`)
      .then((res) => res.data as PaginatedResponse<Plan>),

  getById: (id: number) => api.get<ApiResponse<Plan>>(`/plans/${id}`).then((res) => res.data),

  create: (data: CreatePlanDto) =>
    api.post<ApiResponse<Plan>>('/plans', data).then((res) => res.data),

  update: (id: number, data: UpdatePlanDto) =>
    api.put<ApiResponse<Plan>>(`/plans/${id}`, data).then((res) => res.data),

  delete: (id: number) => api.delete<ApiResponse<void>>(`/plans/${id}`).then((res) => res.data),

  toggleActive: (id: number, actif: boolean) =>
    api.put<ApiResponse<Plan>>(`/plans/${id}`, { actif }).then((res) => res.data),

  trigger: (id: number) =>
    api.post<ApiResponse<Ot>>(`/plans/${id}/trigger`).then((res) => res.data),
};
