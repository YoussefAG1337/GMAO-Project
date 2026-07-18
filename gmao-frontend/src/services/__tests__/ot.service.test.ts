import { describe, it, expect, vi, beforeEach } from 'vitest';
import { otService } from '../ot.service';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('otService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should extract the nested array if present', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { ots: [{ id: 1, description: 'OT1' }] } });
      const result = await otService.getAll();
      expect(api.get).toHaveBeenCalledWith('/ots');
      expect(result).toEqual([{ id: 1, description: 'OT1' }]);
    });

    it('should return data directly if nested array is absent', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: [{ id: 2, description: 'OT2' }] });
      const result = await otService.getAll();
      expect(api.get).toHaveBeenCalledWith('/ots');
      expect(result).toEqual([{ id: 2, description: 'OT2' }]);
    });
  });

  describe('create', () => {
    it('should call api.post', async () => {
      const mockData = {
        atelierId: 1,
        ligneId: 1,
        posteId: 1,
        description: 'Test',
        priorite: 'HAUTE',
        typeMaintenance: 'CURATIVE',
      } as any;
      vi.mocked(api.post).mockResolvedValue({ data: { id: 1, ...mockData } });
      const result = await otService.create(mockData);
      expect(api.post).toHaveBeenCalledWith('/ots', mockData);
      expect(result!.id).toBe(1);
    });
  });

  describe('update', () => {
    it('should call api.put', async () => {
      const mockData = { description: 'Updated' } as any;
      vi.mocked(api.put).mockResolvedValue({ data: { id: 1, ...mockData } });
      const result = await otService.update(1, mockData);
      expect(api.put).toHaveBeenCalledWith('/ots/1', mockData);
      expect(result!.description).toBe('Updated');
    });
  });

  describe('assign', () => {
    it('should call api.patch', async () => {
      const mockData = { technicienId: 5 };
      vi.mocked(api.patch).mockResolvedValue({ data: { id: 1, technicienId: 5 } });
      const result = await otService.assign(1, mockData);
      expect(api.patch).toHaveBeenCalledWith('/ots/1/assign', mockData);
      expect(result!.technicienId).toBe(5);
    });
  });

  describe('delete', () => {
    it('should call api.delete', async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: undefined });
      const result = await otService.delete(1);
      expect(api.delete).toHaveBeenCalledWith('/ots/1');
      expect(result).toBeUndefined();
    });
  });

  describe('start', () => {
    it('should call api.patch', async () => {
      vi.mocked(api.patch).mockResolvedValue({ data: { id: 1, statut: 'EN_COURS' } });
      const result = await otService.start(1);
      expect(api.patch).toHaveBeenCalledWith('/ots/1/start');
      expect(result!.statut).toBe('EN_COURS');
    });
  });

  describe('validate', () => {
    it('should call api.patch', async () => {
      vi.mocked(api.patch).mockResolvedValue({ data: { id: 1, statut: 'TERMINE' } });
      const result = await otService.validate(1);
      expect(api.patch).toHaveBeenCalledWith('/ots/1/validate');
      expect(result!.statut).toBe('TERMINE');
    });
  });

  describe('submitRapport', () => {
    it('should call api.post', async () => {
      const mockData = {
        diagnostic: 'Test',
        causePanne: 'Usure',
        actionsRealisees: 'Fix',
        tempsIntervention: 60,
        commentaires: 'OK',
      };
      vi.mocked(api.post).mockResolvedValue({ data: { success: true } });
      const result = await otService.submitRapport(1, mockData);
      expect(api.post).toHaveBeenCalledWith('/ots/1/rapport', mockData);
      expect(result).toBeDefined();
    });
  });
});
