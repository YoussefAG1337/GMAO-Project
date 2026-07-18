import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyticsService } from '../analytics.service';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn() },
}));

describe('analyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get performance analytics', async () => {
    const mockData = { totalDI: 10, conversionRate: '50.0' };
    vi.mocked(api.get).mockResolvedValue({ data: mockData });
    const result = await analyticsService.getPerformance('2023-01-01', '2023-01-31');
    expect(api.get).toHaveBeenCalledWith('/analytics?startDate=2023-01-01&endDate=2023-01-31');
    expect(result).toEqual(mockData);
  });
});
