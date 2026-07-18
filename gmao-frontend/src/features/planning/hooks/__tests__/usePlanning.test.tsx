import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePlanning } from '../usePlanning';
import { planningService } from '@/services/planning.service';
import { planService } from '@/services/plan.service';
import { SWRConfig } from 'swr';
import React from 'react';

vi.mock('@/services/planning.service', () => ({
  planningService: {
    keys: { calendar: vi.fn().mockReturnValue('/calendar') },
    getCalendar: vi.fn(),
  },
}));

vi.mock('@/services/plan.service', () => ({
  planService: {
    trigger: vi.fn(),
  },
}));

describe('usePlanning hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
  );

  it('should fetch calendar and allow trigger', async () => {
    vi.mocked(planningService.getCalendar).mockResolvedValue({ ots: [], upcomingPlans: [] });
    vi.mocked(planService.trigger).mockResolvedValue({ id: 1 } as any);

    const { result } = renderHook(() => usePlanning(5, 2023), { wrapper });

    await waitFor(() => {
      expect(planningService.getCalendar).toHaveBeenCalledWith(5, 2023);
      expect(result.current.calendarData).toEqual({ ots: [], upcomingPlans: [] });
    });

    await act(async () => {
      await result.current.triggerPlan(5);
    });

    expect(planService.trigger).toHaveBeenCalledWith(5);
  });
});
