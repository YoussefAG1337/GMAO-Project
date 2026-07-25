import { ProduitsClient } from '@/features/produits/components/ProduitsClient';
import { apiServer } from '@/lib/api-server';
import { ApiResponse } from '@/types/api.types';
import { FamilleProduit, Produit } from '@/types/produit.types';

export const metadata = {
  title: 'Produits | GMAO',
};

async function getProduitsData() {
  const [familles, produits] = await Promise.all([
    apiServer
      .get<ApiResponse<FamilleProduit[]>>('/produits/familles')
      .then((res) => res.data)
      .catch(() => []),
    // Primary resource: let failures/redirects surface instead of masking them.
    apiServer.get<ApiResponse<Produit[]>>('/produits').then((res) => res.data),
  ]);

  return {
    familles: Array.isArray(familles) ? familles : [],
    produits: Array.isArray(produits) ? produits : [],
  };
}

export default async function ProduitsPage() {
  const data = await getProduitsData();

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Familles et Produits</h1>
          <p className="text-muted-foreground mt-2">
            Gérez la nomenclature des produits (Familles et Produits).
          </p>
        </div>

        <ProduitsClient initialData={data} />
      </div>
    </div>
  );
}
