import { describe, it, expect, vi, beforeEach } from 'vitest';
import { magasinService } from '../magasin.service';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('magasinService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('pieces', () => {
    it('should get all pieces', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { pieces: [{ id: 1, nom: 'Piece 1' }] } });
      const result = await magasinService.pieces.getAll();
      expect(api.get).toHaveBeenCalledWith('/magasin/pieces');
      expect(result).toEqual([{ id: 1, nom: 'Piece 1' }]);
    });

    it('should create piece', async () => {
      const mockData = { code: 'P1', nom: 'Piece 1', seuilAlerte: 10, prixUnitaire: 5 };
      vi.mocked(api.post).mockResolvedValue({ data: { id: 1, ...mockData } });
      const result = await magasinService.pieces.create(mockData);
      expect(api.post).toHaveBeenCalledWith('/magasin/pieces', mockData);
      expect(result!.id).toBe(1);
    });

    it('should update piece', async () => {
      const mockData = { nom: 'Updated Piece' };
      vi.mocked(api.put).mockResolvedValue({ data: { id: 1, ...mockData } });
      const result = await magasinService.pieces.update(1, mockData);
      expect(api.put).toHaveBeenCalledWith('/magasin/pieces/1', mockData);
      expect(result!.nom).toBe('Updated Piece');
    });

    it('should delete piece', async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: undefined });
      const result = await magasinService.pieces.delete(1);
      expect(api.delete).toHaveBeenCalledWith('/magasin/pieces/1');
      expect(result).toBeUndefined();
    });
  });

  describe('mouvements', () => {
    it('should create mouvement', async () => {
      const mockData = { pieceId: 1, type: 'ENTREE' as const, quantite: 5 };
      vi.mocked(api.post).mockResolvedValue({ data: { id: 1, ...mockData } });
      const result = await magasinService.mouvements.create(mockData);
      expect(api.post).toHaveBeenCalledWith('/magasin/mouvements', mockData);
      expect(result!.id).toBe(1);
    });
  });
});
