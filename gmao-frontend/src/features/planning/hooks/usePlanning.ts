import useSWR from 'swr';
import { planningService } from '@/services/planning.service';
import { planService } from '@/services/plan.service';
import { CalendarResponse } from '@/types/planning.types';

export function usePlanning(month: number, year: number, initialData?: CalendarResponse) {
  const { data, mutate, error, isLoading } = useSWR(
    planningService.keys.calendar(month, year),
    () => planningService.getCalendar(month, year),
    {
      fallbackData: initialData,
    },
  );

  const triggerPlan = async (planId: number) => {
    const result = await planService.trigger(planId);
    await mutate();
    return result;
  };

  return {
    calendarData: data,
    isLoading,
    error,
    isError: !!error,
    mutate,
    triggerPlan,
  };
}
