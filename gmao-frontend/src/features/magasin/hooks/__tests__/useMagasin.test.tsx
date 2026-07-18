import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMagasin } from '../useMagasin';
import { magasinService } from '@/services/magasin.service';
import { SWRConfig } from 'swr';
import React from 'react';

vi.mock('@/services/magasin.service', () => ({
  magasinService: {
    keys: { pieces: '/pieces' },
    pieces: {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    mouvements: {
      create: vi.fn(),
    }
  },
}));

describe('useMagasin hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {children}
    </SWRConfig>
  );

  it('should call createPiece and mutate', async () => {
    vi.mocked(magasinService.pieces.getAll).mockResolvedValue([]);
    vi.mocked(magasinService.pieces.create).mockResolvedValue({ id: 1 } as any);
    
    const { result } = renderHook(() => useMagasin(), { wrapper });
    
    await waitFor(() => {
      expect(magasinService.pieces.getAll).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await result.current.createPiece({ code: 'P1', nom: 'Piece 1', seuilAlerte: 10, prixUnitaire: 5 });
    });

    expect(magasinService.pieces.create).toHaveBeenCalledWith({ code: 'P1', nom: 'Piece 1', seuilAlerte: 10, prixUnitaire: 5 });
    expect(magasinService.pieces.getAll).toHaveBeenCalledTimes(2);
  });

  it('should call createMouvement and mutate', async () => {
    vi.mocked(magasinService.pieces.getAll).mockResolvedValue([]);
    vi.mocked(magasinService.mouvements.create).mockResolvedValue({ id: 1 } as any);
    
    const { result } = renderHook(() => useMagasin(), { wrapper });
    
    await waitFor(() => {
      expect(magasinService.pieces.getAll).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await result.current.createMouvement({ pieceId: 1, type: 'SORTIE', quantite: 2 });
    });

    expect(magasinService.mouvements.create).toHaveBeenCalledWith({ pieceId: 1, type: 'SORTIE', quantite: 2 });
    expect(magasinService.pieces.getAll).toHaveBeenCalledTimes(2);
  });
});
