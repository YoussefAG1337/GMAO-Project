import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rapportService } from '../rapport.service';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('rapportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all rapports', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { rapports: [{ id: 1, diagnostic: 'Test' }] } });
    const result = await rapportService.getAll();
    expect(api.get).toHaveBeenCalledWith('/ots/rapports');
    expect(result).toEqual([{ id: 1, diagnostic: 'Test' }]);
  });
});
