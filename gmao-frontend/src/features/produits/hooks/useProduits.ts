import useSWR from 'swr';
import { produitService } from '@/services/produit.service';
import {
  CreateFamilleDto,
  UpdateFamilleDto,
  CreateProduitDto,
  UpdateProduitDto,
} from '@/types/produit.types';

import { FamilleProduit, Produit } from '@/types/produit.types';

export function useProduits(initialData?: { familles: FamilleProduit[]; produits: Produit[] }) {
  const { data: familles, mutate: mutateFamilles } = useSWR(
    produitService.keys.familles,
    produitService.familles.getAll,
    { fallbackData: initialData?.familles }
  );

  const { data: produits, mutate: mutateProduits } = useSWR(
    produitService.keys.produits,
    produitService.produits.getAll,
    { fallbackData: initialData?.produits }
  );

  const createFamille = async (data: CreateFamilleDto) => {
    const result = await produitService.familles.create(data);
    await mutateFamilles();
    return result;
  };

  const updateFamille = async (id: number, data: UpdateFamilleDto) => {
    const result = await produitService.familles.update(id, data);
    await mutateFamilles();
    return result;
  };

  const deleteFamille = async (id: number) => {
    await produitService.familles.delete(id);
    await mutateFamilles();
  };

  const createProduit = async (data: CreateProduitDto) => {
    const result = await produitService.produits.create(data);
    await mutateProduits();
    return result;
  };

  const updateProduit = async (id: number, data: UpdateProduitDto) => {
    const result = await produitService.produits.update(id, data);
    await mutateProduits();
    return result;
  };

  const deleteProduit = async (id: number) => {
    await produitService.produits.delete(id);
    await mutateProduits();
  };

  return {
    familles: familles ?? [],
    produits: produits ?? [],
    mutateFamilles,
    mutateProduits,
    createFamille,
    updateFamille,
    deleteFamille,
    createProduit,
    updateProduit,
    deleteProduit,
  };
}
