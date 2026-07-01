'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

import { UtilisateursHeader } from '@/features/utilisateurs/components/UtilisateursHeader';
import { UtilisateursTable } from '@/features/utilisateurs/components/UtilisateursTable';
import { UtilisateurEditModal } from '@/features/utilisateurs/components/UtilisateurEditModal';

const fetcher = (url: string) => api.get(url).then((res: any) => res.data);

interface UtilisateursClientProps {
  initialUsers: any[];
}

export function UtilisateursClient({ initialUsers }: UtilisateursClientProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ role: '', actif: false });
  const [isUpdating, setIsUpdating] = useState(false);

  // Seuls les admins peuvent accéder à la gestion complète
  const isAdmin = user?.role === 'ADMIN';

  const { data: users, mutate } = useSWR(isAdmin ? '/users' : null, fetcher, {
    fallbackData: initialUsers,
  });

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500/80" />
        <h2 className="text-xl font-semibold text-white">Accès Restreint</h2>
        <p className="text-muted-foreground">
          Vous n&apos;avez pas les droits pour accéder à cette page.
        </p>
      </div>
    );
  }

  const filteredUsers =
    users?.filter((u: any) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        u.nom.toLowerCase().includes(searchLower) ||
        u.prenom.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        u.role.toLowerCase().includes(searchLower)
      );
    }) || [];

  const handleOpenEdit = (u: any) => {
    setSelectedUser(u);
    setEditForm({ role: u.role, actif: u.actif });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsUpdating(true);
    try {
      await api.put(`/users/${selectedUser.id}`, editForm);
      toast.success('Utilisateur mis à jour avec succès');
      setIsEditModalOpen(false);
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.put(`/users/${id}`, { actif: true });
      toast.success('Compte approuvé avec succès');
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'approbation");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <UtilisateursHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <UtilisateursTable
        filteredUsers={filteredUsers}
        onApprove={handleApprove}
        onOpenEdit={handleOpenEdit}
      />

      <UtilisateurEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateUser}
        editForm={editForm}
        setEditForm={setEditForm}
        isUpdating={isUpdating}
      />
    </div>
  );
}
