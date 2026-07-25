import { api } from '@/lib/api';
import { CreateDiDto, UpdateDiDto, Di } from '@/types/di.types';
import { Ot } from '@/types/ot.types';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';
import { buildListQuery, ListParams } from '@/lib/pagination';

export const diService = {
  keys: {
    list: (params: ListParams = {}) => `/dis?${buildListQuery(params)}`,
    detail: (id: number) => `/dis/${id}`,
  },

  list: (params: ListParams = {}) =>
    api
      .get<ApiResponse<PaginatedResponse<Di>>>(`/dis?${buildListQuery(params)}`)
      .then((res) => res.data as PaginatedResponse<Di>),

  create: (data: FormData | CreateDiDto) =>
    api.post<ApiResponse<Di>>('/dis', data).then((res) => res.data),

  update: (id: number, data: UpdateDiDto) =>
    api.put<ApiResponse<Di>>(`/dis/${id}`, data).then((res) => res.data),

  delete: (id: number) => api.delete<ApiResponse<void>>(`/dis/${id}`).then((res) => res.data),

  startWork: (id: number) =>
    api.post<ApiResponse<Ot>>(`/ots/start-from-di/${id}`).then((res) => res.data),
};
