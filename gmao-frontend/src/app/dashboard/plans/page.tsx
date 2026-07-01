import { apiServer } from '@/lib/api-server';
import { PlansClient } from '@/features/plans/components/PlansClient';

export default async function PlansMaintenancePage() {
  // Fetch initial data on the server
  const plans = await apiServer
    .get<any>('/plans')
    .then((res) => res.data)
    .catch(() => []);
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

  return (
    <PlansClient
      initialPlans={plans}
      initialAteliers={ateliers}
      initialLignes={lignes}
      initialPostes={postes}
    />
  );
}
