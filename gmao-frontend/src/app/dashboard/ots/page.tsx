import { apiServer } from '@/lib/api-server';
import { OtsClient } from '@/features/ots/components/OtsClient';
import { ApiResponse } from '@/types/api.types';
import { Ot } from '@/types/ot.types';
import { Atelier, Ligne, Poste } from '@/types/equipement.types';
import { User } from '@/types/index';

export default async function OrdresTravailPage() {
  const [otsData, ateliers, lignes, postes, techniciens] = await Promise.all([
    apiServer
      .get<ApiResponse<Ot[]>>('/ots')
      .then((res) => res.data)
      .catch(() => ({ ots: [] })),
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
    apiServer
      .get<ApiResponse<User[]>>('/users/techniciens')
      .then((res) => res.data)
      .catch(() => []),
  ]);

  return (
    <OtsClient
      initialOts={otsData}
      initialAteliers={ateliers || []}
      initialLignes={lignes || []}
      initialPostes={postes || []}
      initialTechniciens={techniciens || []}
    />
  );
}
