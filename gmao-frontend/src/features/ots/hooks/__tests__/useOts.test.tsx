import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useOts } from '../useOts';
import { otService } from '@/services/ot.service';
import { SWRConfig } from 'swr';
import React from 'react';

const emptyPage = { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };

vi.mock('@/services/ot.service', () => ({
  otService: {
    keys: { list: () => '/ots' },
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    assign: vi.fn(),
    delete: vi.fn(),
    start: vi.fn(),
    submitRapport: vi.fn(),
    validerTechnicien: vi.fn(),
    validate: vi.fn(),
    reporter: vi.fn(),
    annuler: vi.fn(),
    nonValider: vi.fn(),
  },
}));

describe('useOts hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
  );

  it('should fetch data and return it', async () => {
    vi.mocked(otService.list).mockResolvedValue({
      ...emptyPage,
      items: [{ id: 1, code: 'OT-001' }],
      total: 1,
    } as any);

    const { result } = renderHook(() => useOts(), { wrapper });

    await waitFor(() => {
      expect(result.current.ots).toEqual([{ id: 1, code: 'OT-001' }]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should call createOt and trigger mutate', async () => {
    vi.mocked(otService.list).mockResolvedValue(emptyPage as any);
    vi.mocked(otService.create).mockResolvedValue({ id: 2 } as any);

    const { result } = renderHook(() => useOts(), { wrapper });

    await waitFor(() => {
      expect(otService.list).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await result.current.createOt({
        description: 'Test',
        priorite: 'HAUTE',
        typeMaintenance: 'CURATIVE',
        atelierId: 1,
        ligneId: 1,
        posteId: 1,
      });
    });

    expect(otService.create).toHaveBeenCalled();
    expect(otService.list).toHaveBeenCalledTimes(2);
  });
});
