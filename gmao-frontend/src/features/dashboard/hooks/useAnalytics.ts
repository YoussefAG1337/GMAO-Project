import useSWR from 'swr';
import { analyticsService } from '@/services/analytics.service';

export function useAnalytics(startDate: string, endDate: string) {
  const { data, error, isLoading, mutate } = useSWR(
    startDate && endDate ? analyticsService.keys.performance(startDate, endDate) : null,
    () => analyticsService.getPerformance(startDate, endDate),
  );

  return {
    analytics: data,
    isLoading,
    error,
    isError: !!error,
    mutate,
  };
}
