import { apiServer } from '@/lib/api-server';
import { PlansClient } from '@/features/plans/components/PlansClient';
import { ApiResponse } from '@/types/api.types';
import { Plan } from '@/types/plan.types';
import { Atelier, Ligne, Poste } from '@/types/equipement.types';

export default async function PlansMaintenancePage() {
  // Fetch initial data on the server
  const [plans, ateliers, lignes, postes] = await Promise.all([
    apiServer
      .get<ApiResponse<Plan[]>>('/plans')
      .then((res) => res.data)
      .catch(() => []),
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
  ]);

  return (
    <PlansClient
      initialPlans={plans || []}
      initialAteliers={ateliers || []}
      initialLignes={lignes || []}
      initialPostes={postes || []}
    />
  );
}
