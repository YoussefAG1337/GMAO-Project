import { api } from '@/lib/api';
import { ApiResponse } from '@/types/api.types';
import { Piece, Mouvement, CreatePieceDto, UpdatePieceDto, CreateMouvementDto } from '@/types/magasin.types';

export const magasinService = {
  keys: {
    pieces: '/magasin/pieces',
  },

  pieces: {
    getAll: () =>
      api.get<ApiResponse<{ pieces: Piece[] } | Piece[]>>('/magasin/pieces').then((res) => {
        const data = res.data;
        return (data && 'pieces' in data && Array.isArray(data.pieces)) ? data.pieces : (data as Piece[]);
      }),
    create: (data: CreatePieceDto) =>
      api.post<ApiResponse<Piece>>('/magasin/pieces', data).then((res) => res.data),
    update: (id: number, data: UpdatePieceDto) =>
      api.put<ApiResponse<Piece>>(`/magasin/pieces/${id}`, data).then((res) => res.data),
    delete: (id: number) =>
      api.delete<ApiResponse<void>>(`/magasin/pieces/${id}`).then((res) => res.data),
  },

  mouvements: {
    create: (data: CreateMouvementDto) =>
      api.post<ApiResponse<Mouvement>>('/magasin/mouvements', data).then((res) => res.data),
  }
};
