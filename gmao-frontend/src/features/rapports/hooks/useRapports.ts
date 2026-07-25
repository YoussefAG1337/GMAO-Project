import useSWR from 'swr';
import { rapportService } from '@/services/rapport.service';
import { Rapport } from '@/types/rapport.types';
import { ListParams } from '@/lib/pagination';
import { PaginatedResponse } from '@/types/api.types';

export function useRapports(params: ListParams = {}, initialData?: PaginatedResponse<Rapport>) {
  const { data, mutate, error, isLoading } = useSWR(
    rapportService.keys.list(params),
    () => rapportService.list(params),
    { fallbackData: initialData, keepPreviousData: true },
  );

  return {
    rapports: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    error,
    isError: !!error,
    mutate,
  };
}
