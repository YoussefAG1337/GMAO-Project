import { apiServer } from '@/lib/api-server';
import { RapportsClient } from '@/features/rapports/components/RapportsClient';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';
import { Rapport } from '@/types/rapport.types';
import { parseListParams, buildListQuery, emptyPage } from '@/lib/pagination';

export default async function RapportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseListParams(await searchParams);

  // Primary resource: let failures/redirects surface instead of masking them.
  const rapports = await apiServer
    .get<ApiResponse<PaginatedResponse<Rapport>>>(`/ots/rapports?${buildListQuery(params)}`)
    .then((res) => res.data ?? emptyPage<Rapport>());

  return <RapportsClient initialData={rapports} />;
}
