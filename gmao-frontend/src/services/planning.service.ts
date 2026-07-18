import { api } from '@/lib/api';
import { ApiResponse } from '@/types/api.types';
import { CalendarResponse } from '@/types/planning.types';

export const planningService = {
  keys: {
    calendar: (month: number, year: number) => `/calendar?month=${month}&year=${year}`,
  },

  getCalendar: (month: number, year: number) =>
    api
      .get<ApiResponse<CalendarResponse>>(`/calendar?month=${month}&year=${year}`)
      .then((res) => res.data),
};
