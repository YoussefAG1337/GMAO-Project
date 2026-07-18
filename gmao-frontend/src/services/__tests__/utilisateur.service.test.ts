import { describe, it, expect, vi, beforeEach } from 'vitest';
import { utilisateurService } from '../utilisateur.service';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe('utilisateurService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get all users', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { users: [{ id: 1, nom: 'Admin' }] } });
    const result = await utilisateurService.getAll();
    expect(api.get).toHaveBeenCalledWith('/users');
    expect(result).toEqual([{ id: 1, nom: 'Admin' }]);
  });

  it('should update user', async () => {
    const mockData = { role: 'TECHNICIEN' };
    vi.mocked(api.put).mockResolvedValue({ data: { id: 1, ...mockData } });
    const result = await utilisateurService.update(1, mockData);
    expect(api.put).toHaveBeenCalledWith('/users/1', mockData);
    expect(result!.role).toBe('TECHNICIEN');
  });
});
