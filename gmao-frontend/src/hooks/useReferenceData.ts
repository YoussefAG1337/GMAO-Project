import useSWR from 'swr';

interface ReferenceDataOptions {
  initialAteliers?: any[];
  initialLignes?: any[];
  initialPostes?: any[];
  initialTechniciens?: any[];
}

export function useReferenceData(options: ReferenceDataOptions = {}) {
  const { data: ateliers, mutate: mutateAteliers } = useSWR('/equipements/ateliers', {
    fallbackData: options.initialAteliers,
  });

  const { data: lignes, mutate: mutateLignes } = useSWR('/equipements/lignes', {
    fallbackData: options.initialLignes,
  });

  const { data: postes, mutate: mutatePostes } = useSWR('/equipements/postes', {
    fallbackData: options.initialPostes,
  });

  const { data: techniciensList, mutate: mutateTechniciens } = useSWR('/users/techniciens', {
    fallbackData: options.initialTechniciens,
  });

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
