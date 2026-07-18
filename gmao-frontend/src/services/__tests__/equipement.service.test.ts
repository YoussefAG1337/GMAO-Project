import { describe, it, expect, vi, beforeEach } from 'vitest';
import { equipementService } from '../equipement.service';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('equipementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ateliers', () => {
    it('should create atelier', async () => {
      const mockData = { nom: 'Atelier 1', description: 'Test' };
      vi.mocked(api.post).mockResolvedValue({ data: { id: 1, ...mockData } });
      const result = await equipementService.ateliers.create(mockData);
      expect(api.post).toHaveBeenCalledWith('/equipements/ateliers', mockData);
      expect(result!.id).toBe(1);
    });
  });

  describe('lignes', () => {
    it('should update ligne', async () => {
      const mockData = { nom: 'Ligne 1' };
      vi.mocked(api.put).mockResolvedValue({ data: { id: 1, ...mockData } });
      const result = await equipementService.lignes.update(1, mockData);
      expect(api.put).toHaveBeenCalledWith('/equipements/lignes/1', mockData);
      expect(result!.nom).toBe('Ligne 1');
    });
  });

  describe('postes', () => {
    it('should delete poste', async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: undefined });
      const result = await equipementService.postes.delete(1);
      expect(api.delete).toHaveBeenCalledWith('/equipements/postes/1');
      expect(result).toBeUndefined();
    });

    it('should toggle active status', async () => {
      vi.mocked(api.put).mockResolvedValue({ data: { id: 1, actif: false } });
      const result = await equipementService.postes.toggleActive(1, false);
      expect(api.put).toHaveBeenCalledWith('/equipements/postes/1', { actif: false });
      expect(result!.actif).toBe(false);
    });
  });
});
