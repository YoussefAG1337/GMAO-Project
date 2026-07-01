import { apiServer } from '@/lib/api-server';
import { OtsClient } from '@/features/ots/components/OtsClient';

export default async function OrdresTravailPage() {
  const otsData = await apiServer
    .get<any>('/ots')
    .then((res) => res.data)
    .catch(() => ({ ots: [] }));
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
    <OtsClient
      initialOts={otsData}
      initialAteliers={ateliers}
      initialLignes={lignes}
      initialPostes={postes}
      initialTechniciens={techniciens}
    />
  );
}
