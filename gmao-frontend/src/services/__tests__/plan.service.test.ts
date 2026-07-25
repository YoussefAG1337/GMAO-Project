import { describe, it, expect, vi, beforeEach } from 'vitest';
import { planService } from '../plan.service';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('planService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call api.get for list and return the paginated envelope', async () => {
    const page = {
      items: [{ id: 1, intitule: 'Plan 1' }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    vi.mocked(api.get).mockResolvedValue({ data: page });
    const result = await planService.list({ actif: 'true' });
    expect(api.get).toHaveBeenCalledWith('/plans?actif=true');
    expect(result).toEqual(page);
  });

  it('should call api.post for create', async () => {
    const mockData = {
      intitule: 'Plan 1',
      atelierId: 1,
      ligneId: 1,
      posteId: 1,
      frequence: 'MENSUELLE',
      prochaineExecution: '2023-01-01',
    } as any;
    vi.mocked(api.post).mockResolvedValue({ data: { id: 1, ...mockData } });
    const result = await planService.create(mockData);
    expect(api.post).toHaveBeenCalledWith('/plans', mockData);
    expect(result!.id).toBe(1);
  });

  it('should call api.put for update', async () => {
    const mockData = { intitule: 'Plan Updated' };
    vi.mocked(api.put).mockResolvedValue({ data: { id: 1, ...mockData } });
    const result = await planService.update(1, mockData);
    expect(api.put).toHaveBeenCalledWith('/plans/1', mockData);
    expect(result!.intitule).toBe('Plan Updated');
  });

  it('should call api.delete for delete', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: undefined });
    const result = await planService.delete(1);
    expect(api.delete).toHaveBeenCalledWith('/plans/1');
    expect(result).toBeUndefined();
  });

  it('should call api.post for trigger', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { numeroOT: 'OT-001' } });
    const result = await planService.trigger(1);
    expect(api.post).toHaveBeenCalledWith('/plans/1/trigger');
    expect((result as any)!.numeroOT).toBe('OT-001');
  });
});
