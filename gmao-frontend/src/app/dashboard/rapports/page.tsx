import { apiServer } from '@/lib/api-server';
import { RapportsClient } from '@/features/rapports/components/RapportsClient';
import { ApiResponse } from '@/types/api.types';
import { Rapport } from '@/types/rapport.types';

export default async function RapportsPage() {
  const rapports = await apiServer
    .get<ApiResponse<Rapport[]>>('/ots/rapports')
    .then((res) => res.data)
    .catch(() => []);

  return <RapportsClient initialRapports={rapports || []} />;
}
