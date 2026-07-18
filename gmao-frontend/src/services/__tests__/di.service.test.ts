import { describe, it, expect, vi, beforeEach } from 'vitest';
import { diService } from '../di.service';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('diService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all DIs and extract the nested array if present', async () => {
      // Mocking the scenario where backend returns { data: { dis: [...] } }
      vi.mocked(api.get).mockResolvedValue({ data: { dis: [{ id: 1, name: 'Panne' }] } });

      const result = await diService.getAll();

      expect(api.get).toHaveBeenCalledWith('/dis');
      expect(result).toEqual([{ id: 1, name: 'Panne' }]);
    });

    it('should fetch all DIs and return data directly if nested array is absent', async () => {
      // Mocking the scenario where backend returns just an array in { data: [...] }
      vi.mocked(api.get).mockResolvedValue({ data: [{ id: 2, name: 'Autre' }] });

      const result = await diService.getAll();

      expect(api.get).toHaveBeenCalledWith('/dis');
      expect(result).toEqual([{ id: 2, name: 'Autre' }]);
    });
  });

  describe('create', () => {
    it('should call api.post with correct parameters', async () => {
      const mockData = { atelierId: '1', ligneId: '2', posteId: '3', priorite: 'HAUTE' } as any;
      vi.mocked(api.post).mockResolvedValue({ data: { id: 1, ...mockData } });

      const result = await diService.create(mockData);

      expect(api.post).toHaveBeenCalledWith('/dis', mockData);
      expect(result).toEqual({ id: 1, ...mockData });
    });
  });

  describe('update', () => {
    it('should call api.put with correct parameters', async () => {
      const mockData = { priorite: 'URGENTE' } as any;
      vi.mocked(api.put).mockResolvedValue({ data: { id: 1, ...mockData } });

      const result = await diService.update(1, mockData);

      expect(api.put).toHaveBeenCalledWith('/dis/1', mockData);
      expect(result).toEqual({ id: 1, ...mockData });
    });
  });

  describe('delete', () => {
    it('should call api.delete with correct parameters', async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: { success: true } });

      const result = await diService.delete(1);

      expect(api.delete).toHaveBeenCalledWith('/dis/1');
      expect(result).toEqual({ success: true });
    });
  });

  describe('startWork', () => {
    it('should call api.post for starting work', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { otId: 5 } });

      const result = await diService.startWork(1);

      expect(api.post).toHaveBeenCalledWith('/ots/start-from-di/1');
      expect(result).toEqual({ otId: 5 });
    });
  });
});
