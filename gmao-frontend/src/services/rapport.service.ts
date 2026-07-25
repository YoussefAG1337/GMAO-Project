import { api } from '@/lib/api';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';
import { Rapport } from '@/types/rapport.types';
import { buildListQuery, ListParams } from '@/lib/pagination';

export const rapportService = {
  keys: {
    list: (params: ListParams = {}) => `/ots/rapports?${buildListQuery(params)}`,
  },

  list: (params: ListParams = {}) =>
    api
      .get<ApiResponse<PaginatedResponse<Rapport>>>(`/ots/rapports?${buildListQuery(params)}`)
      .then((res) => res.data as PaginatedResponse<Rapport>),
};
