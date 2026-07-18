import useSWR from 'swr';
import { equipementService } from '@/services/equipement.service';
import { Atelier, Ligne, Poste } from '@/types/equipement.types';
import { User } from '@/types/index';

interface ReferenceDataOptions {
  initialAteliers?: Atelier[];
  initialLignes?: Ligne[];
  initialPostes?: Poste[];
  initialTechniciens?: User[];
  fetchTechniciens?: boolean;
}

export function useReferenceData(options: ReferenceDataOptions = {}) {
  const { data: ateliers, mutate: mutateAteliers } = useSWR(
    equipementService.keys.ateliers,
    equipementService.ateliers.getAll,
    { fallbackData: options.initialAteliers }
  );

  const { data: lignes, mutate: mutateLignes } = useSWR(
    equipementService.keys.lignes,
    equipementService.lignes.getAll,
    { fallbackData: options.initialLignes }
  );

  const { data: postes, mutate: mutatePostes } = useSWR(
    equipementService.keys.postes,
    equipementService.postes.getAll,
    { fallbackData: options.initialPostes }
  );

  const { data: techniciensList, mutate: mutateTechniciens } = useSWR<User[]>(
    options.fetchTechniciens ? '/users/techniciens' : null,
    { fallbackData: options.initialTechniciens }
  );

  return {
    ateliers: ateliers || [],
    mutateAteliers,
    lignes: lignes || [],
    mutateLignes,
    postes: postes || [],
    mutatePostes,
    techniciens: techniciensList || [],
    mutateTechniciens,
  };
}
