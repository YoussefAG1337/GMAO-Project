import { describe, it, expect, vi, beforeEach } from 'vitest';
import { panneService } from '../panne.service';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('panneService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get all pannes for a ligne', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [{ id: 1, nom: 'Panne' }] });
    const result = await panneService.getAll(1, null);
    expect(api.get).toHaveBeenCalledWith('/pannes?ligneId=1');
    expect(result).toEqual([{ id: 1, nom: 'Panne' }]);
  });

  it('should create panne', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { id: 2, nom: 'Panne 2' } });
    const result = await panneService.create({ nom: 'Panne 2', ligneId: 1 });
    expect(api.post).toHaveBeenCalledWith('/pannes', { nom: 'Panne 2', ligneId: 1 });
    expect((result as any).nom).toBe('Panne 2');
  });
});
