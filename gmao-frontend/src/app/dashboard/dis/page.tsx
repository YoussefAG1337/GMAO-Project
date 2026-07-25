import { apiServer, REFERENCE_REVALIDATE } from '@/lib/api-server';
import { DisClient } from '@/features/dis/components/DisClient';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';
import { Di } from '@/types/di.types';
import { Atelier, Ligne, Poste } from '@/types/equipement.types';
import { parseListParams, buildListQuery, emptyPage } from '@/lib/pagination';

export default async function DemandesInterventionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseListParams(await searchParams);

  const [disData, ateliers, lignes, postes] = await Promise.all([
    // Primary resource: let failures/redirects surface (no .catch).
    apiServer
      .get<ApiResponse<PaginatedResponse<Di>>>(`/dis?${buildListQuery(params)}`)
      .then((res) => res.data ?? emptyPage<Di>()),
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
  ]);

  return (
    <DisClient
      initialData={disData}
      initialAteliers={ateliers || ([] as Atelier[])}
      initialLignes={lignes || []}
      initialPostes={postes || []}
    />
  );
}
