import useSWR from 'swr';
import { planService } from '@/services/plan.service';
import { CreatePlanDto, UpdatePlanDto } from '@/types/plan.types';

export function usePlans(initialData?: any) {
  const { data, mutate, error, isLoading } = useSWR(planService.keys.all, planService.getAll, {
    fallbackData: initialData,
  });

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
    plans: data ?? [],
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
