import useSWR from 'swr';
import { otService } from '@/services/ot.service';
import {
  CreateOtDto,
  UpdateOtDto,
  AssignOtDto,
  SubmitRapportDto,
  RaisonDto,
  Ot,
} from '@/types/ot.types';
import { ListParams } from '@/lib/pagination';
import { PaginatedResponse } from '@/types/api.types';

export function useOts(params: ListParams = {}, initialData?: PaginatedResponse<Ot>) {
  const { data, mutate, error, isLoading } = useSWR(
    otService.keys.list(params),
    () => otService.list(params),
    { fallbackData: initialData, keepPreviousData: true },
  );

  const createOt = async (data: CreateOtDto) => {
    const result = await otService.create(data);
    await mutate();
    return result;
  };

  const updateOt = async (id: number, data: UpdateOtDto) => {
    const result = await otService.update(id, data);
    await mutate();
    return result;
  };

  const assignOt = async (id: number, data: AssignOtDto) => {
    const result = await otService.assign(id, data);
    await mutate();
    return result;
  };

  const deleteOt = async (id: number) => {
    const result = await otService.delete(id);
    await mutate();
    return result;
  };

  const startOt = async (id: number) => {
    const result = await otService.start(id);
    await mutate();
    return result;
  };

  const submitRapport = async (id: number, data: SubmitRapportDto) => {
    const result = await otService.submitRapport(id, data);
    await mutate();
    return result;
  };

  const validerTechnicien = async (id: number) => {
    const result = await otService.validerTechnicien(id);
    await mutate();
    return result;
  };

  const validateOt = async (id: number) => {
    const result = await otService.validate(id);
    await mutate();
    return result;
  };

  const reporterOt = async (id: number, data: RaisonDto) => {
    const result = await otService.reporter(id, data);
    await mutate();
    return result;
  };

  const annulerOt = async (id: number, data: RaisonDto) => {
    const result = await otService.annuler(id, data);
    await mutate();
    return result;
  };

  const nonValiderOt = async (id: number, data: RaisonDto) => {
    const result = await otService.nonValider(id, data);
    await mutate();
    return result;
  };

  return {
    ots: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    error,
    isError: !!error,
    mutate,
    createOt,
    updateOt,
    assignOt,
    deleteOt,
    startOt,
    submitRapport,
    validerTechnicien,
    validateOt,
    reporterOt,
    annulerOt,
    nonValiderOt,
  };
}
