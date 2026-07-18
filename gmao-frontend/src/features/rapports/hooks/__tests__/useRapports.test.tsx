import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRapports } from '../useRapports';
import { rapportService } from '@/services/rapport.service';
import { SWRConfig } from 'swr';
import React from 'react';

vi.mock('@/services/rapport.service', () => ({
  rapportService: {
    keys: { all: '/rapports' },
    getAll: vi.fn(),
  },
}));

describe('useRapports hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
  );

  it('should fetch rapports', async () => {
    vi.mocked(rapportService.getAll).mockResolvedValue([{ id: 1 } as any]);

    const { result } = renderHook(() => useRapports(), { wrapper });

    await waitFor(() => {
      expect(rapportService.getAll).toHaveBeenCalledTimes(1);
      expect(result.current.rapports).toEqual([{ id: 1 }]);
    });
  });
});
