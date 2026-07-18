import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProduits } from '../useProduits';
import { produitService } from '@/services/produit.service';
import { SWRConfig } from 'swr';
import React from 'react';

vi.mock('@/services/produit.service', () => ({
  produitService: {
    keys: { familles: '/familles', produits: '/produits' },
    familles: {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    produits: {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }
  },
}));

describe('useProduits hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {children}
    </SWRConfig>
  );

  it('should call createFamille and mutateFamilles', async () => {
    vi.mocked(produitService.familles.getAll).mockResolvedValue([]);
    vi.mocked(produitService.familles.create).mockResolvedValue({ id: 1 } as any);
    
    const { result } = renderHook(() => useProduits(), { wrapper });
    
    await waitFor(() => {
      expect(produitService.familles.getAll).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await result.current.createFamille({ nom: 'Famille 1' });
    });

    expect(produitService.familles.create).toHaveBeenCalledWith({ nom: 'Famille 1' });
    expect(produitService.familles.getAll).toHaveBeenCalledTimes(2);
  });

  it('should call deleteProduit and mutateProduits', async () => {
    vi.mocked(produitService.produits.getAll).mockResolvedValue([]);
    vi.mocked(produitService.produits.delete).mockResolvedValue(undefined as any);
    
    const { result } = renderHook(() => useProduits(), { wrapper });
    
    await waitFor(() => {
      expect(produitService.produits.getAll).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await result.current.deleteProduit(1);
    });

    expect(produitService.produits.delete).toHaveBeenCalledWith(1);
    expect(produitService.produits.getAll).toHaveBeenCalledTimes(2);
  });
});
