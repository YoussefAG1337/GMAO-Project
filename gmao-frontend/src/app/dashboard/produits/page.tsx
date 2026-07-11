import { ProduitsClient } from '@/features/produits/components/ProduitsClient';
import { apiServer } from '@/lib/api-server';

export const metadata = {
  title: 'Produits | GMAO',
};

async function getProduitsData() {
  const [familles, produits] = await Promise.all([
    apiServer
      .get<any>('/produits/familles')
      .then((res) => res.data)
      .catch(() => []),
    apiServer
      .get<any>('/produits')
      .then((res) => res.data)
      .catch(() => []),
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
