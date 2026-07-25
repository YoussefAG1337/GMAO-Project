import useSWR from 'swr';
import { diService } from '@/services/di.service';
import { CreateDiDto, UpdateDiDto, Di } from '@/types/di.types';
import { ListParams } from '@/lib/pagination';
import { PaginatedResponse } from '@/types/api.types';

export function useDis(params: ListParams = {}, initialData?: PaginatedResponse<Di>) {
  const { data, mutate, error, isLoading } = useSWR(
    diService.keys.list(params),
    () => diService.list(params),
    { fallbackData: initialData, keepPreviousData: true },
  );

  const createDi = async (data: FormData | CreateDiDto) => {
    const result = await diService.create(data);
    await mutate();
    return result;
  };

  const updateDi = async (id: number, data: UpdateDiDto) => {
    const result = await diService.update(id, data);
    await mutate();
    return result;
  };

  const deleteDi = async (id: number) => {
    const result = await diService.delete(id);
    await mutate();
    return result;
  };

  const startWork = async (id: number) => {
    const result = await diService.startWork(id);
    await mutate();
    return result;
  };

  return {
    dis: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    error,
    isError: !!error,
    mutate,
    createDi,
    updateDi,
    deleteDi,
    startWork,
  };
}
