import useSWR from 'swr';
import { diService } from '@/services/di.service';
import { CreateDiDto, UpdateDiDto } from '@/types/di.types';

export function useDis(initialData?: any) {
  const { data, mutate, error, isLoading } = useSWR(diService.keys.all, diService.getAll, {
    fallbackData: initialData?.dis ?? initialData,
  });

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
    dis: data ?? [],
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
