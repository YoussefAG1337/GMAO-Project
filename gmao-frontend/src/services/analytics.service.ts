import { api } from '@/lib/api';
import { AnalyticsData, WorkrateData } from '@/types/analytics.types';
import { ApiResponse } from '@/types/api.types';

export const analyticsService = {
  keys: {
    performance: (start: string, end: string) => `/analytics?startDate=${start}&endDate=${end}`,
    workrates: (date: string) => `/analytics/workrates?date=${date}`,
  },

  getPerformance: (startDate: string, endDate: string) =>
    api.get<ApiResponse<AnalyticsData>>(`/analytics?startDate=${startDate}&endDate=${endDate}`).then((res) => {
      // Handle the case where response might be wrapped or raw
      return (res.data as any).data ? (res.data as any).data : res.data;
    }),

  getWorkrates: (date: string): Promise<WorkrateData> =>
    api
      .get<ApiResponse<WorkrateData>>(`/analytics/workrates?date=${date}`)
      .then((res) => ((res.data as any).data ? (res.data as any).data : res.data)),
};
