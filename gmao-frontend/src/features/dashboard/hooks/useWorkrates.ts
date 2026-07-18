import useSWR from 'swr';
import { analyticsService } from '@/services/analytics.service';
import { WorkrateData } from '@/types/analytics.types';

export function useWorkrates(date: string) {
  const { data, error, isLoading, mutate } = useSWR<WorkrateData>(
    date ? analyticsService.keys.workrates(date) : null,
    () => analyticsService.getWorkrates(date),
  );

  return {
    workrateData: data,
    isLoading,
    error,
    isError: !!error,
    mutate,
  };
}
