import { apiServer } from '@/lib/api-server';
import { OtsClient } from '@/features/ots/components/OtsClient';

export default async function OrdresTravailPage() {
  const [otsData, ateliers, lignes, postes, techniciens] = await Promise.all([
    apiServer
      .get<any>('/ots')
      .then((res) => res.data)
      .catch(() => ({ ots: [] })),
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
    apiServer
      .get<any>('/users/techniciens')
      .then((res) => res.data)
      .catch(() => []),
  ]);

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
