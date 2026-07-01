import { apiServer } from '@/lib/api-server';
import { RapportsClient } from '@/features/rapports/components/RapportsClient';

export default async function RapportsPage() {
  const rapports = await apiServer
    .get<any>('/ots/rapports')
    .then((res) => res.data)
    .catch(() => []);

  return <RapportsClient initialRapports={rapports} />;
}
