import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useOts } from '../useOts';
import { otService } from '@/services/ot.service';
import { SWRConfig } from 'swr';
import React from 'react';

vi.mock('@/services/ot.service', () => ({
  otService: {
    keys: { all: '/ots' },
    getAll: vi.fn(),
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
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {children}
    </SWRConfig>
  );

  it('should fetch data and return it', async () => {
    vi.mocked(otService.getAll).mockResolvedValue([{ id: 1, code: 'OT-001' } as any]);
    
    const { result } = renderHook(() => useOts(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.ots).toEqual([{ id: 1, code: 'OT-001' }]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should call createOt and trigger mutate', async () => {
    vi.mocked(otService.getAll).mockResolvedValue([]);
    vi.mocked(otService.create).mockResolvedValue({ id: 2 } as any);
    
    const { result } = renderHook(() => useOts(), { wrapper });
    
    await waitFor(() => {
      expect(otService.getAll).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await result.current.createOt({ description: 'Test', priorite: 'HAUTE', typeMaintenance: 'CURATIVE', atelierId: 1, ligneId: 1, posteId: 1 });
    });

    expect(otService.create).toHaveBeenCalled();
    expect(otService.getAll).toHaveBeenCalledTimes(2);
  });
});
