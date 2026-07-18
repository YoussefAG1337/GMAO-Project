import { api } from '@/lib/api';
import { ApiResponse } from '@/types/api.types';
import { Plan, CreatePlanDto, UpdatePlanDto } from '@/types/plan.types';
import { Ot } from '@/types/ot.types';

export const planService = {
  keys: {
    all: '/plans',
    detail: (id: number) => `/plans/${id}`,
  },

  getAll: () =>
    api.get<ApiResponse<{ plans: Plan[] } | Plan[]>>('/plans').then((res) => {
      const data = res.data;
      return (data && 'plans' in data && Array.isArray(data.plans)) ? data.plans : (data as Plan[]);
    }),

  getById: (id: number) =>
    api.get<ApiResponse<Plan>>(`/plans/${id}`).then((res) => res.data),

  create: (data: CreatePlanDto) =>
    api.post<ApiResponse<Plan>>('/plans', data).then((res) => res.data),

  update: (id: number, data: UpdatePlanDto) =>
    api.put<ApiResponse<Plan>>(`/plans/${id}`, data).then((res) => res.data),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/plans/${id}`).then((res) => res.data),

  toggleActive: (id: number, actif: boolean) =>
    api.put<ApiResponse<Plan>>(`/plans/${id}`, { actif }).then((res) => res.data),

  trigger: (id: number) =>
    api.post<ApiResponse<Ot>>(`/plans/${id}/trigger`).then((res) => res.data),
};
