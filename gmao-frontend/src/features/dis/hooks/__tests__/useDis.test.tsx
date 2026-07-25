import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDis } from '../useDis';
import { diService } from '@/services/di.service';
import { SWRConfig } from 'swr';
import React from 'react';

vi.mock('@/services/di.service', () => ({
  diService: {
    keys: { list: () => '/dis' },
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    startWork: vi.fn(),
  },
}));

const emptyPage = { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };

describe('useDis hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
  );

  it('should fetch a page and expose items + meta', async () => {
    vi.mocked(diService.list).mockResolvedValue({
      ...emptyPage,
      items: [{ id: 1, code: 'DI-001' }],
      total: 1,
    } as any);

    const { result } = renderHook(() => useDis(), { wrapper });

    await waitFor(() => {
      expect(result.current.dis).toEqual([{ id: 1, code: 'DI-001' }]);
      expect(result.current.total).toBe(1);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should call createDi and trigger mutate', async () => {
    vi.mocked(diService.list).mockResolvedValue(emptyPage as any);
    vi.mocked(diService.create).mockResolvedValue({ id: 2 } as any);

    const { result } = renderHook(() => useDis(), { wrapper });

    // wait for initial fetch
    await waitFor(() => {
      expect(diService.list).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await result.current.createDi({ priorite: 'HAUTE' } as any);
    });

    expect(diService.create).toHaveBeenCalled();
    // mutate() forces a re-validation (re-fetch)
    expect(diService.list).toHaveBeenCalledTimes(2);
  });
});
