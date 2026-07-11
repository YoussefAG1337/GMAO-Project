import { apiServer } from '@/lib/api-server';
import { DisClient } from '@/features/dis/components/DisClient';

export default async function DemandesInterventionPage() {
  const [disData, ateliers, lignes, postes] = await Promise.all([
    apiServer
      .get<any>('/dis')
      .then((res) => res.data)
      .catch(() => ({ dis: [] })),
    apiServer
      .get<any>('/equipements/ateliers')
      .then((res) => res.data)
      .catch(() => []),
    apiServer
      .get<any>('/equipements/lignes')
      .then((res) => res.data)
      .catch(() => []),
    apiServer
      .get<any>('/equipements/postes')
      .then((res) => res.data)
      .catch(() => []),
  ]);

  return (
    <DisClient
      initialDis={disData}
      initialAteliers={ateliers}
      initialLignes={lignes}
      initialPostes={postes}
    />
  );
}
