import { api } from '@/lib/api';
import { ApiResponse } from '@/types/api.types';
import {
  FamilleProduit,
  Produit,
  CreateFamilleDto,
  UpdateFamilleDto,
  CreateProduitDto,
  UpdateProduitDto,
} from '@/types/produit.types';

export const produitService = {
  keys: {
    familles: '/produits/familles',
    produits: '/produits',
  },

  familles: {
    getAll: () =>
      api
        .get<ApiResponse<{ familles: FamilleProduit[] } | FamilleProduit[]>>('/produits/familles')
        .then((res) => {
          const data = res.data;
          return data && 'familles' in data && Array.isArray(data.familles)
            ? data.familles
            : (data as FamilleProduit[]);
        }),
    create: (data: CreateFamilleDto) =>
      api.post<ApiResponse<FamilleProduit>>('/produits/familles', data).then((res) => res.data),
    update: (id: number, data: UpdateFamilleDto) =>
      api
        .put<ApiResponse<FamilleProduit>>(`/produits/familles/${id}`, data)
        .then((res) => res.data),
    delete: (id: number) =>
      api.delete<ApiResponse<void>>(`/produits/familles/${id}`).then((res) => res.data),
  },

  produits: {
    getAll: () =>
      api.get<ApiResponse<{ produits: Produit[] } | Produit[]>>('/produits').then((res) => {
        const data = res.data;
        return data && 'produits' in data && Array.isArray(data.produits)
          ? data.produits
          : (data as Produit[]);
      }),
    create: (data: CreateProduitDto) =>
      api.post<ApiResponse<Produit>>('/produits', data).then((res) => res.data),
    update: (id: number, data: UpdateProduitDto) =>
      api.put<ApiResponse<Produit>>(`/produits/${id}`, data).then((res) => res.data),
    delete: (id: number) =>
      api.delete<ApiResponse<void>>(`/produits/${id}`).then((res) => res.data),
  },
};
