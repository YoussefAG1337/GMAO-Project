import { describe, it, expect, vi, beforeEach } from 'vitest';
import { planningService } from '../planning.service';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('planningService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch calendar', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { ots: [], upcomingPlans: [] } });
    const result = await planningService.getCalendar(5, 2023);
    expect(api.get).toHaveBeenCalledWith('/calendar?month=5&year=2023');
    expect(result!.ots).toEqual([]);
  });
});
