import { api } from '@/lib/api';
import { ApiResponse } from '@/types/api.types';
import { User } from '@/types/index';
import { UpdateUserDto } from '@/types/utilisateur.types';

export const utilisateurService = {
  keys: {
    all: '/users',
  },

  getAll: () =>
    api.get<ApiResponse<{ users: User[] } | User[]>>('/users').then((res) => {
      const data = res.data;
      return (data && 'users' in data && Array.isArray(data.users)) ? data.users : (data as User[]);
    }),

  update: (id: number, data: UpdateUserDto) =>
    api.put<ApiResponse<User>>(`/users/${id}`, data).then((res) => res.data),
};
