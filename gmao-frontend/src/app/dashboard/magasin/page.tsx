import { MagasinClient } from '@/features/magasin/components/MagasinClient';
import { apiServer } from '@/lib/api-server';
import { ApiResponse } from '@/types/api.types';
import { Piece } from '@/types/magasin.types';

export const metadata = {
  title: 'Magasin PDR | GMAO',
};

async function getMagasinData() {
  const data = await apiServer
    .get<ApiResponse<Piece[]>>('/magasin/pieces')
    .then((res) => res.data)
    .catch((error) => {
      console.error('Erreur lors du chargement des données magasin:', error);
      return [];
    });

  return {
    pieces: Array.isArray(data) ? data : [],
  };
}

export default async function MagasinPage() {
  const data = await getMagasinData();

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Magasin PDR</h1>
          <p className="text-muted-foreground mt-2">
            Gestion du stock des pièces de rechange et mouvements.
          </p>
        </div>

        <MagasinClient initialData={data} />
      </div>
    </div>
  );
}
