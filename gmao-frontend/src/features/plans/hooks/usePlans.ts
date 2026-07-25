import useSWR from 'swr';
import { planService } from '@/services/plan.service';
import { CreatePlanDto, UpdatePlanDto, Plan } from '@/types/plan.types';
import { ListParams } from '@/lib/pagination';
import { PaginatedResponse } from '@/types/api.types';

export function usePlans(params: ListParams = {}, initialData?: PaginatedResponse<Plan>) {
  const { data, mutate, error, isLoading } = useSWR(
    planService.keys.list(params),
    () => planService.list(params),
    { fallbackData: initialData, keepPreviousData: true },
  );

  const createPlan = async (data: CreatePlanDto) => {
    const result = await planService.create(data);
    await mutate();
    return result;
  };

  const updatePlan = async (id: number, data: UpdatePlanDto) => {
    const result = await planService.update(id, data);
    await mutate();
    return result;
  };

  const deletePlan = async (id: number) => {
    await planService.delete(id);
    await mutate();
  };

  const togglePlanActive = async (id: number, actif: boolean) => {
    const result = await planService.toggleActive(id, actif);
    await mutate();
    return result;
  };

  const triggerPlan = async (id: number) => {
    const result = await planService.trigger(id);
    await mutate();
    return result;
  };

  return {
    plans: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    error,
    isError: !!error,
    mutate,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanActive,
    triggerPlan,
  };
}
