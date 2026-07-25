import { apiServer } from '@/lib/api-server';
import { UtilisateursClient } from '@/features/utilisateurs/components/UtilisateursClient';
import { ApiResponse } from '@/types/api.types';
import { User } from '@/types/index';

export default async function UtilisateursPage() {
  // A non-admin gets 403 here by design — the client renders an "Accès Restreint"
  // screen from the client-side role, so we swallow the error and pass []. But we
  // must NOT swallow the /login redirect (expired session) thrown as NEXT_REDIRECT.
  const users = await apiServer
    .get<ApiResponse<User[]>>('/users')
    .then((res) => res.data)
    .catch((err) => {
      if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err;
      return [];
    });

  return <UtilisateursClient initialUsers={users || []} />;
}
