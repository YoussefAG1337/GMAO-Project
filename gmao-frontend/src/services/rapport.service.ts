import { api } from '@/lib/api';
import { ApiResponse } from '@/types/api.types';
import { Rapport } from '@/types/rapport.types';

export const rapportService = {
  keys: {
    all: '/ots/rapports',
  },

  getAll: () =>
    api.get<ApiResponse<{ rapports: Rapport[] } | Rapport[]>>('/ots/rapports').then((res) => {
      const data = res.data;
      return (data && 'rapports' in data && Array.isArray(data.rapports)) ? data.rapports : (data as Rapport[]);
    }),
};
