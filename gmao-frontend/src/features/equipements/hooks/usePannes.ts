import useSWR from 'swr';
import { panneService } from '@/services/panne.service';
import { CreatePanneDto, UpdatePanneDto } from '@/types/panne.types';

export function usePannes(ligneId?: number | null, posteId?: number | null) {
  const { data, error, isLoading, mutate } = useSWR(panneService.keys.all(ligneId, posteId), () =>
    panneService.getAll(ligneId, posteId),
  );

  const createPanne = async (data: CreatePanneDto) => {
    const result = await panneService.create(data);
    await mutate();
    return result;
  };

  const updatePanne = async (id: number, data: UpdatePanneDto) => {
    const result = await panneService.update(id, data);
    await mutate();
    return result;
  };

  const deletePanne = async (id: number) => {
    await panneService.delete(id);
    await mutate();
  };

  return {
    pannes: data ?? [],
    isLoading,
    error,
    isError: !!error,
    mutate,
    createPanne,
    updatePanne,
    deletePanne,
  };
}
