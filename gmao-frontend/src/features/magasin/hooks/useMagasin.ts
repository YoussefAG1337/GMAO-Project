import useSWR from 'swr';
import { magasinService } from '@/services/magasin.service';
import { CreatePieceDto, UpdatePieceDto, CreateMouvementDto } from '@/types/magasin.types';

import { Piece } from '@/types/magasin.types';

export function useMagasin(initialData?: { pieces: Piece[] }) {
  const { data, mutate, error, isLoading } = useSWR(
    magasinService.keys.pieces,
    magasinService.pieces.getAll,
    { fallbackData: initialData?.pieces },
  );

  const createPiece = async (data: CreatePieceDto) => {
    const result = await magasinService.pieces.create(data);
    await mutate();
    return result;
  };

  const updatePiece = async (id: number, data: UpdatePieceDto) => {
    const result = await magasinService.pieces.update(id, data);
    await mutate();
    return result;
  };

  const deletePiece = async (id: number) => {
    await magasinService.pieces.delete(id);
    await mutate();
  };

  const createMouvement = async (data: CreateMouvementDto) => {
    const result = await magasinService.mouvements.create(data);
    await mutate();
    return result;
  };

  return {
    pieces: data ?? [],
    isLoading,
    error,
    isError: !!error,
    mutate,
    createPiece,
    updatePiece,
    deletePiece,
    createMouvement,
  };
}
