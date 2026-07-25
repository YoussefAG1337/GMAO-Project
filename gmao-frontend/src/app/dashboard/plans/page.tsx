import { apiServer, REFERENCE_REVALIDATE } from '@/lib/api-server';
import { PlansClient } from '@/features/plans/components/PlansClient';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';
import { Plan } from '@/types/plan.types';
import { Atelier, Ligne, Poste } from '@/types/equipement.types';
import { parseListParams, buildListQuery, emptyPage } from '@/lib/pagination';

export default async function PlansMaintenancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseListParams(await searchParams);

  const [plans, ateliers, lignes, postes] = await Promise.all([
    // Primary resource: let failures/redirects surface instead of masking them.
    apiServer
      .get<ApiResponse<PaginatedResponse<Plan>>>(`/plans?${buildListQuery(params)}`)
      .then((res) => res.data ?? emptyPage<Plan>()),
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
    <PlansClient
      initialData={plans}
      initialAteliers={ateliers || []}
      initialLignes={lignes || []}
      initialPostes={postes || []}
    />
  );
}
