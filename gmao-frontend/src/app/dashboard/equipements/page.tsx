import { apiServer, REFERENCE_REVALIDATE } from '@/lib/api-server';
import { EquipementsClient } from '@/features/equipements/components/EquipementsClient';
import { ApiResponse } from '@/types/api.types';
import { Atelier, Ligne, Poste } from '@/types/equipement.types';

export default async function EquipementsPage() {
  const [ateliers, lignes, postes] = await Promise.all([
    apiServer
      .get<ApiResponse<Atelier[]>>('/equipements/ateliers', { revalidate: REFERENCE_REVALIDATE })
      .then((res) => res.data),
    apiServer
      .get<ApiResponse<Ligne[]>>('/equipements/lignes', { revalidate: REFERENCE_REVALIDATE })
      .then((res) => res.data),
    apiServer
      .get<ApiResponse<Poste[]>>('/equipements/postes', { revalidate: REFERENCE_REVALIDATE })
      .then((res) => res.data),
  ]);

  return (
    <EquipementsClient
      initialAteliers={ateliers || []}
      initialLignes={lignes || []}
      initialPostes={postes || []}
    />
  );
}
