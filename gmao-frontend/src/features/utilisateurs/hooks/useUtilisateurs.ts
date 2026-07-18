import useSWR from 'swr';
import { utilisateurService } from '@/services/utilisateur.service';
import { User } from '@/types/index';
import { UpdateUserDto } from '@/types/utilisateur.types';

export function useUtilisateurs(initialData?: User[], enabled: boolean = true) {
  const { data, mutate, error, isLoading } = useSWR(
    enabled ? utilisateurService.keys.all : null,
    utilisateurService.getAll,
    { fallbackData: initialData }
  );

  const updateUser = async (id: number, data: UpdateUserDto) => {
    const result = await utilisateurService.update(id, data);
    await mutate();
    return result;
  };

  const approveUser = async (id: number) => {
    const result = await utilisateurService.update(id, { actif: true });
    await mutate();
    return result;
  };

  return {
    users: data ?? [],
    isLoading,
    error,
    isError: !!error,
    mutate,
    updateUser,
    approveUser,
  };
}
