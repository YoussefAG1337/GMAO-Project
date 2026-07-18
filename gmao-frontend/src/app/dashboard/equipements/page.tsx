import { apiServer } from '@/lib/api-server';
import { EquipementsClient } from '@/features/equipements/components/EquipementsClient';
import { ApiResponse } from '@/types/api.types';
import { Atelier, Ligne, Poste } from '@/types/equipement.types';

export default async function EquipementsPage() {
  const [ateliers, lignes, postes] = await Promise.all([
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
    <EquipementsClient initialAteliers={ateliers || []} initialLignes={lignes || []} initialPostes={postes || []} />
  );
}
