'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUtilisateurs } from '@/features/utilisateurs/hooks/useUtilisateurs';
import { User } from '@/types/index';
import { ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

import { UtilisateursHeader } from '@/features/utilisateurs/components/UtilisateursHeader';
import { UtilisateursTable } from '@/features/utilisateurs/components/UtilisateursTable';
import { UtilisateurEditModal } from '@/features/utilisateurs/components/UtilisateurEditModal';
import { getErrorMessage } from '@/lib/error';
import { type UtilisateurEditFormData } from '@/lib/validations/utilisateur';


interface UtilisateursClientProps {
  initialUsers: User[];
}

export function UtilisateursClient({ initialUsers }: UtilisateursClientProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [initialEditData, setInitialEditData] = useState<{
    role: string;
    actif: boolean;
    lignes?: number[];
  } | null>(null);

  // Seuls les admins peuvent accéder à la gestion complète
  const isAdmin = user?.role === 'ADMIN';

  const { users, updateUser, approveUser } = useUtilisateurs(initialUsers, isAdmin);

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
    users.filter((u: User) => {
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
    setInitialEditData({
      role: u.role,
      actif: u.actif,
      lignes: u.lignes?.map((tl: any) => tl.ligneId) || [],
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (data: UtilisateurEditFormData) => {
    if (!selectedUser) return;
    try {
      await updateUser(selectedUser.id, {
        role: data.role,
        actif: data.actif,
        lignes: data.lignes,
      });
      toast.success('Utilisateur mis à jour avec succès');
      setIsEditModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur lors de la mise à jour');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveUser(id);
      toast.success('Compte approuvé avec succès');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Erreur lors de l'approbation");
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

      {initialEditData && (
        <UtilisateurEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateUser}
          initialData={initialEditData}
        />
      )}
    </div>
  );
}
