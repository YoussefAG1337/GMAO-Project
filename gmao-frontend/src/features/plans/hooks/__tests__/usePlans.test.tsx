import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePlans } from '../usePlans';
import { planService } from '@/services/plan.service';
import { SWRConfig } from 'swr';
import React from 'react';

const emptyPage = { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };

vi.mock('@/services/plan.service', () => ({
  planService: {
    keys: { list: () => '/plans', detail: vi.fn() },
    list: vi.fn(),
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
    vi.mocked(planService.list).mockResolvedValue(emptyPage as any);
    vi.mocked(planService.trigger).mockResolvedValue({ id: 1 } as any);

    const { result } = renderHook(() => usePlans(), { wrapper });

    await waitFor(() => {
      expect(planService.list).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await result.current.triggerPlan(5);
    });

    expect(planService.trigger).toHaveBeenCalledWith(5);
    expect(planService.list).toHaveBeenCalledTimes(2);
  });
});
