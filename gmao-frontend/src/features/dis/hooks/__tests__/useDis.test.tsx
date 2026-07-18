import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDis } from '../useDis';
import { diService } from '@/services/di.service';
import { SWRConfig } from 'swr';
import React from 'react';

vi.mock('@/services/di.service', () => ({
  diService: {
    keys: { all: '/dis' },
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    startWork: vi.fn(),
  },
}));

describe('useDis hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {children}
    </SWRConfig>
  );

  it('should fetch data and return it', async () => {
    vi.mocked(diService.getAll).mockResolvedValue([{ id: 1, code: 'DI-001' } as any]);
    
    const { result } = renderHook(() => useDis(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.dis).toEqual([{ id: 1, code: 'DI-001' }]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should call createDi and trigger mutate', async () => {
    vi.mocked(diService.getAll).mockResolvedValue([]);
    vi.mocked(diService.create).mockResolvedValue({ id: 2 } as any);
    
    const { result } = renderHook(() => useDis(), { wrapper });
    
    // wait for initial fetch
    await waitFor(() => {
      expect(diService.getAll).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await result.current.createDi({ priorite: 'HAUTE' } as any);
    });

    expect(diService.create).toHaveBeenCalled();
    // mutate() forces a re-validation (re-fetch)
    expect(diService.getAll).toHaveBeenCalledTimes(2);
  });
});
