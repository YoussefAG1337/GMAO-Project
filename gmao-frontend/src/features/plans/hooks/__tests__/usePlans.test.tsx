import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePlans } from '../usePlans';
import { planService } from '@/services/plan.service';
import { SWRConfig } from 'swr';
import React from 'react';

vi.mock('@/services/plan.service', () => ({
  planService: {
    keys: { all: '/plans', detail: vi.fn() },
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    toggleActive: vi.fn(),
    trigger: vi.fn(),
  },
}));

describe('usePlans hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
  );

  it('should call trigger and mutate', async () => {
    vi.mocked(planService.getAll).mockResolvedValue([]);
    vi.mocked(planService.trigger).mockResolvedValue({ id: 1 } as any);

    const { result } = renderHook(() => usePlans(), { wrapper });

    await waitFor(() => {
      expect(planService.getAll).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await result.current.triggerPlan(5);
    });

    expect(planService.trigger).toHaveBeenCalledWith(5);
    expect(planService.getAll).toHaveBeenCalledTimes(2);
  });
});
