import { api } from '@/lib/api';
import { CreateDiDto, UpdateDiDto, Di } from '@/types/di.types';
import { Ot } from '@/types/ot.types';
import { ApiResponse } from '@/types/api.types';

export const diService = {
  keys: {
    all: '/dis',
    detail: (id: number) => `/dis/${id}`,
  },

  getAll: () =>
    api.get<ApiResponse<{ dis: Di[] } | Di[]>>('/dis').then((res) => {
      const data = res.data;
      return data && 'dis' in data && Array.isArray(data.dis) ? data.dis : (data as Di[]);
    }),

  create: (data: FormData | CreateDiDto) =>
    api.post<ApiResponse<Di>>('/dis', data).then((res) => res.data),

  update: (id: number, data: UpdateDiDto) =>
    api.put<ApiResponse<Di>>(`/dis/${id}`, data).then((res) => res.data),

  delete: (id: number) => api.delete<ApiResponse<void>>(`/dis/${id}`).then((res) => res.data),

  startWork: (id: number) =>
    api.post<ApiResponse<Ot>>(`/ots/start-from-di/${id}`).then((res) => res.data),
};
