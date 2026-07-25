import { apiServer, REFERENCE_REVALIDATE } from '@/lib/api-server';
import { OtsClient } from '@/features/ots/components/OtsClient';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';
import { Ot } from '@/types/ot.types';
import { Atelier, Ligne, Poste } from '@/types/equipement.types';
import { User } from '@/types/index';
import { parseListParams, buildListQuery, emptyPage } from '@/lib/pagination';

export default async function OrdresTravailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseListParams(await searchParams);

  const [otsData, ateliers, lignes, postes, techniciens] = await Promise.all([
    apiServer
      .get<ApiResponse<PaginatedResponse<Ot>>>(`/ots?${buildListQuery(params)}`)
      .then((res) => res.data ?? emptyPage<Ot>()),
    apiServer
      .get<ApiResponse<Atelier[]>>('/equipements/ateliers', { revalidate: REFERENCE_REVALIDATE })
      .then((res) => res.data)
      .catch(() => []),
    apiServer
      .get<ApiResponse<Ligne[]>>('/equipements/lignes', { revalidate: REFERENCE_REVALIDATE })
      .then((res) => res.data)
      .catch(() => []),
    apiServer
      .get<ApiResponse<Poste[]>>('/equipements/postes', { revalidate: REFERENCE_REVALIDATE })
      .then((res) => res.data)
      .catch(() => []),
    apiServer
      .get<ApiResponse<User[]>>('/users/techniciens', { revalidate: REFERENCE_REVALIDATE })
      .then((res) => res.data)
      .catch(() => []),
  ]);

  return (
    <OtsClient
      initialData={otsData}
      initialAteliers={ateliers || []}
      initialLignes={lignes || []}
      initialPostes={postes || []}
      initialTechniciens={techniciens || []}
    />
  );
}
