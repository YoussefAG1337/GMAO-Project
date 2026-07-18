import { apiServer } from '@/lib/api-server';
import { DisClient } from '@/features/dis/components/DisClient';
import { ApiResponse } from '@/types/api.types';
import { Di } from '@/types/di.types';
import { Atelier, Ligne, Poste } from '@/types/equipement.types';

export default async function DemandesInterventionPage() {
  const [disData, ateliers, lignes, postes] = await Promise.all([
    apiServer
      .get<ApiResponse<Di[]>>('/dis')
      .then((res) => res.data)
      .catch(() => [] as any),
    apiServer
      .get<ApiResponse<Atelier[]>>('/equipements/ateliers')
      .then((res) => res.data)
      .catch(() => []),
    apiServer
      .get<ApiResponse<Ligne[]>>('/equipements/lignes')
      .then((res) => res.data)
      .catch(() => []),
    apiServer
      .get<ApiResponse<Poste[]>>('/equipements/postes')
      .then((res) => res.data)
      .catch(() => []),
  ]);

  return (
    <DisClient
      initialDis={disData}
      initialAteliers={ateliers || ([] as any)}
      initialLignes={lignes || []}
      initialPostes={postes || []}
    />
  );
}
