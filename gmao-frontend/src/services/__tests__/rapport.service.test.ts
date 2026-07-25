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

  it('should fetch a page of rapports and return the paginated envelope', async () => {
    const page = {
      items: [{ id: 1, diagnostic: 'Test' }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    vi.mocked(api.get).mockResolvedValue({ data: page });
    const result = await rapportService.list({ page: 1 });
    expect(api.get).toHaveBeenCalledWith('/ots/rapports?page=1');
    expect(result).toEqual(page);
  });
});
