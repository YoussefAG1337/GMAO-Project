import { describe, it, expect, vi, beforeEach } from 'vitest';
import { produitService } from '../produit.service';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('produitService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('familles', () => {
    it('should get all familles', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { familles: [{ id: 1, nom: 'Famille 1' }] } });
      const result = await produitService.familles.getAll();
      expect(api.get).toHaveBeenCalledWith('/produits/familles');
      expect(result).toEqual([{ id: 1, nom: 'Famille 1' }]);
    });

    it('should create famille', async () => {
      const mockData = { nom: 'Famille 1' };
      vi.mocked(api.post).mockResolvedValue({ data: { id: 1, ...mockData } });
      const result = await produitService.familles.create(mockData);
      expect(api.post).toHaveBeenCalledWith('/produits/familles', mockData);
      expect(result!.id).toBe(1);
    });
  });

  describe('produits', () => {
    it('should update produit', async () => {
      const mockData = { nom: 'Updated Produit', familleProduitId: 1 };
      vi.mocked(api.put).mockResolvedValue({ data: { id: 1, ...mockData } });
      const result = await produitService.produits.update(1, mockData);
      expect(api.put).toHaveBeenCalledWith('/produits/1', mockData);
      expect(result!.nom).toBe('Updated Produit');
    });

    it('should delete produit', async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: undefined });
      const result = await produitService.produits.delete(1);
      expect(api.delete).toHaveBeenCalledWith('/produits/1');
      expect(result).toBeUndefined();
    });
  });
});
