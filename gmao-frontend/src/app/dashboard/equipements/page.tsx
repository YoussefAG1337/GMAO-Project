import { apiServer } from '@/lib/api-server';
import { EquipementsClient } from '@/features/equipements/components/EquipementsClient';

export default async function EquipementsPage() {
  const [ateliers, lignes, postes] = await Promise.all([
    apiServer
      .get<any>('/equipements/ateliers')
      .then((res) => res.data)
      .catch(() => []),
    apiServer
      .get<any>('/equipements/lignes')
      .then((res) => res.data)
      .catch(() => []),
    apiServer
      .get<any>('/equipements/postes')
      .then((res) => res.data)
      .catch(() => []),
  ]);

  return (
    <EquipementsClient initialAteliers={ateliers} initialLignes={lignes} initialPostes={postes} />
  );
}
