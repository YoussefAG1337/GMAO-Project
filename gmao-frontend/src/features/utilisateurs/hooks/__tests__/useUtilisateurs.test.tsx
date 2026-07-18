import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUtilisateurs } from '../useUtilisateurs';
import { utilisateurService } from '@/services/utilisateur.service';
import { SWRConfig } from 'swr';
import React from 'react';

vi.mock('@/services/utilisateur.service', () => ({
  utilisateurService: {
    keys: { all: '/users' },
    getAll: vi.fn(),
    update: vi.fn(),
  },
}));

describe('useUtilisateurs hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
  );

  it('should call updateUser and mutate', async () => {
    vi.mocked(utilisateurService.getAll).mockResolvedValue([]);
    vi.mocked(utilisateurService.update).mockResolvedValue({ id: 1, role: 'ADMIN' } as any);

    const { result } = renderHook(() => useUtilisateurs(), { wrapper });

    await waitFor(() => {
      expect(utilisateurService.getAll).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await result.current.updateUser(1, { role: 'ADMIN' });
    });

    expect(utilisateurService.update).toHaveBeenCalledWith(1, { role: 'ADMIN' });
    expect(utilisateurService.getAll).toHaveBeenCalledTimes(2);
  });

  it('should not fetch if enabled is false', async () => {
    renderHook(() => useUtilisateurs([], false), { wrapper });

    await waitFor(() => {
      expect(utilisateurService.getAll).toHaveBeenCalledTimes(0);
    });
  });
});
