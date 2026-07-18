import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEquipementManager } from '../useEquipementManager';
import { equipementService } from '@/services/equipement.service';
import { SWRConfig } from 'swr';
import React from 'react';

vi.mock('@/services/equipement.service', () => ({
  equipementService: {
    keys: { ateliers: '/ateliers', lignes: '/lignes', postes: '/postes' },
    ateliers: { create: vi.fn(), update: vi.fn(), delete: vi.fn(), toggleActive: vi.fn() },
    lignes: { create: vi.fn(), update: vi.fn(), delete: vi.fn(), toggleActive: vi.fn() },
    postes: { create: vi.fn(), update: vi.fn(), delete: vi.fn(), toggleActive: vi.fn() },
  },
}));

describe('useEquipementManager hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
  );

  it('should call createAtelier and trigger mutate', async () => {
    vi.mocked(equipementService.ateliers.create).mockResolvedValue({ id: 1 } as any);

    const { result } = renderHook(() => useEquipementManager(), { wrapper });

    await act(async () => {
      await result.current.createAtelier({ nom: 'Atelier A', description: 'Test' });
    });

    expect(equipementService.ateliers.create).toHaveBeenCalledWith({
      nom: 'Atelier A',
      description: 'Test',
    });
  });

  it('should call deleteLigne and trigger mutate', async () => {
    vi.mocked(equipementService.lignes.delete).mockResolvedValue(undefined as any);

    const { result } = renderHook(() => useEquipementManager(), { wrapper });

    await act(async () => {
      await result.current.deleteLigne(5);
    });

    expect(equipementService.lignes.delete).toHaveBeenCalledWith(5);
  });
});
