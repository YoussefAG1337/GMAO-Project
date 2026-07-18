import { mutate } from 'swr';
import { equipementService } from '@/services/equipement.service';
import {
  CreateAtelierDto,
  UpdateAtelierDto,
  CreateLigneDto,
  UpdateLigneDto,
  CreatePosteDto,
  UpdatePosteDto,
} from '@/types/equipement.types';

export function useEquipementManager() {
  // ATELIERS
  const createAtelier = async (data: CreateAtelierDto) => {
    const result = await equipementService.ateliers.create(data);
    await mutate(equipementService.keys.ateliers);
    return result;
  };

  const updateAtelier = async (id: number, data: UpdateAtelierDto) => {
    const result = await equipementService.ateliers.update(id, data);
    await mutate(equipementService.keys.ateliers);
    return result;
  };

  const deleteAtelier = async (id: number) => {
    await equipementService.ateliers.delete(id);
    await mutate(equipementService.keys.ateliers);
  };

  const toggleAtelierActive = async (id: number, actif: boolean) => {
    const result = await equipementService.ateliers.toggleActive(id, actif);
    await mutate(equipementService.keys.ateliers);
    return result;
  };

  // LIGNES
  const createLigne = async (data: CreateLigneDto) => {
    const result = await equipementService.lignes.create(data);
    await mutate(equipementService.keys.lignes);
    return result;
  };

  const updateLigne = async (id: number, data: UpdateLigneDto) => {
    const result = await equipementService.lignes.update(id, data);
    await mutate(equipementService.keys.lignes);
    return result;
  };

  const deleteLigne = async (id: number) => {
    await equipementService.lignes.delete(id);
    await mutate(equipementService.keys.lignes);
  };

  const toggleLigneActive = async (id: number, actif: boolean) => {
    const result = await equipementService.lignes.toggleActive(id, actif);
    await mutate(equipementService.keys.lignes);
    return result;
  };

  // POSTES
  const createPoste = async (data: CreatePosteDto) => {
    const result = await equipementService.postes.create(data);
    await mutate(equipementService.keys.postes);
    return result;
  };

  const updatePoste = async (id: number, data: UpdatePosteDto) => {
    const result = await equipementService.postes.update(id, data);
    await mutate(equipementService.keys.postes);
    return result;
  };

  const deletePoste = async (id: number) => {
    await equipementService.postes.delete(id);
    await mutate(equipementService.keys.postes);
  };

  const togglePosteActive = async (id: number, actif: boolean) => {
    const result = await equipementService.postes.toggleActive(id, actif);
    await mutate(equipementService.keys.postes);
    return result;
  };

  return {
    createAtelier,
    updateAtelier,
    deleteAtelier,
    toggleAtelierActive,
    createLigne,
    updateLigne,
    deleteLigne,
    toggleLigneActive,
    createPoste,
    updatePoste,
    deletePoste,
    togglePosteActive,
  };
}
