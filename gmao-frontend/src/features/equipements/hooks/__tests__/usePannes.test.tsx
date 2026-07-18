import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePannes } from '../usePannes';
import { panneService } from '@/services/panne.service';
import { SWRConfig } from 'swr';
import React from 'react';

vi.mock('@/services/panne.service', () => ({
  panneService: {
    keys: { all: () => '/pannes' },
    getAll: vi.fn(),
    create: vi.fn(),
  },
}));

describe('usePannes hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {children}
    </SWRConfig>
  );

  it('should call createPanne and mutate', async () => {
    vi.mocked(panneService.getAll).mockResolvedValue([]);
    vi.mocked(panneService.create).mockResolvedValue({ id: 1, nom: 'Test Panne' } as any);
    
    const { result } = renderHook(() => usePannes(1, null), { wrapper });
    
    await waitFor(() => {
      expect(panneService.getAll).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await result.current.createPanne({ nom: 'Test Panne', ligneId: 1 });
    });

    expect(panneService.create).toHaveBeenCalledWith({ nom: 'Test Panne', ligneId: 1 });
    expect(panneService.getAll).toHaveBeenCalledTimes(2);
  });
});
