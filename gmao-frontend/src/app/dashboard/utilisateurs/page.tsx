import { apiServer } from '@/lib/api-server';
import { UtilisateursClient } from '@/features/utilisateurs/components/UtilisateursClient';

export default async function UtilisateursPage() {
  // If the user isn't an admin, this request might fail with 403.
  // The client component will handle the "Accès Restreint" screen based on the client-side user role.
  const users = await apiServer
    .get<any>('/users')
    .then((res) => res.data)
    .catch(() => []);

  return <UtilisateursClient initialUsers={users} />;
}
