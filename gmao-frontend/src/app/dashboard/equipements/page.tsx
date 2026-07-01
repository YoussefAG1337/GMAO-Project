import { apiServer } from '@/lib/api-server';
import { EquipementsClient } from '@/features/equipements/components/EquipementsClient';

export default async function EquipementsPage() {
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
    <EquipementsClient initialAteliers={ateliers} initialLignes={lignes} initialPostes={postes} />
  );
}
