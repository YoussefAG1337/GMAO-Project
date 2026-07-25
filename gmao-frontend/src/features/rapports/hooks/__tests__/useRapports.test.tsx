import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRapports } from '../useRapports';
import { rapportService } from '@/services/rapport.service';
import { SWRConfig } from 'swr';
import React from 'react';

const emptyPage = { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };

vi.mock('@/services/rapport.service', () => ({
  rapportService: {
    keys: { list: () => '/ots/rapports' },
    list: vi.fn(),
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
    vi.mocked(rapportService.list).mockResolvedValue({
      ...emptyPage,
      items: [{ id: 1 }],
      total: 1,
    } as any);

    const { result } = renderHook(() => useRapports(), { wrapper });

    await waitFor(() => {
      expect(rapportService.list).toHaveBeenCalledTimes(1);
      expect(result.current.rapports).toEqual([{ id: 1 }]);
    });
  });
});
