import useSWR from 'swr';
import { rapportService } from '@/services/rapport.service';
import { Rapport } from '@/types/rapport.types';

export function useRapports(initialData?: Rapport[]) {
  const { data, mutate, error, isLoading } = useSWR(
    rapportService.keys.all,
    rapportService.getAll,
    { fallbackData: initialData },
  );

  return {
    rapports: data ?? [],
    isLoading,
    error,
    isError: !!error,
    mutate,
  };
}
