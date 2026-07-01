import { apiServer } from '@/lib/api-server';
import { DisClient } from '@/features/dis/components/DisClient';

export default async function DemandesInterventionPage() {
  const disData = await apiServer
    .get<any>('/dis')
    .then((res) => res.data)
    .catch(() => ({ dis: [] }));
  const ateliers = await apiServer
    .get<any>('/equipements/ateliers')
    .then((res) => res.data)
    .catch(() => []);
  const lignes = await apiServer
    .get<any>('/equipements/lignes')
    .then((res) => res.data)
    .catch(() => []);
  const postes = await apiServer
    .get<any>('/equipements/postes')
    .then((res) => res.data)
    .catch(() => []);
  const techniciens = await apiServer
    .get<any>('/users/techniciens')
    .then((res) => res.data)
    .catch(() => []);

  return (
    <DisClient
      initialDis={disData}
      initialAteliers={ateliers}
      initialLignes={lignes}
      initialPostes={postes}
      initialTechniciens={techniciens}
    />
  );
}
