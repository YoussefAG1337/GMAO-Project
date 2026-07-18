import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAnalytics } from '../useAnalytics';
import { analyticsService } from '@/services/analytics.service';
import { SWRConfig } from 'swr';
import React from 'react';

vi.mock('@/services/analytics.service', () => ({
  analyticsService: {
    keys: { performance: () => '/analytics' },
    getPerformance: vi.fn(),
  },
}));

describe('useAnalytics hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
  );

  it('should fetch analytics data', async () => {
    const mockData = { totalDI: 15 };
    vi.mocked(analyticsService.getPerformance).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useAnalytics('2023-01-01', '2023-01-31'), { wrapper });

    await waitFor(() => {
      expect(result.current.analytics).toEqual(mockData);
    });
    expect(analyticsService.getPerformance).toHaveBeenCalledWith('2023-01-01', '2023-01-31');
  });

  it('should not fetch if dates are missing', async () => {
    renderHook(() => useAnalytics('', ''), { wrapper });
    await waitFor(() => {
      expect(analyticsService.getPerformance).toHaveBeenCalledTimes(0);
    });
  });
});
