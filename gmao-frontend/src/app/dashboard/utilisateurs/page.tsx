'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Users, Search, CheckCircle2, XCircle, ShieldAlert, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';

const fetcher = (url: string) => api.get(url).then((res: any) => res.data);

export default function UtilisateursPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ role: '', actif: false });
  const [isUpdating, setIsUpdating] = useState(false);

  // Seuls les admins peuvent accéder à la gestion complète
  const isAdmin = user?.role === 'ADMIN';

  const { data: users, error, isLoading, mutate } = useSWR(isAdmin ? '/users' : null, fetcher);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500/80" />
        <h2 className="text-xl font-semibold text-white">Accès Restreint</h2>
        <p className="text-muted-foreground">Vous n&apos;avez pas les droits pour accéder à cette page.</p>
      </div>
    );
  }

  const filteredUsers = users?.filter((u: any) => {
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
      toast.error(err.message || 'Erreur lors de l\'approbation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les accès, approuvez les nouvelles inscriptions et assignez les rôles.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500">Erreur lors du chargement des utilisateurs.</div>
      ) : (
        <div className="bg-zinc-950/50 border border-white/10 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/10">
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Utilisateur</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rôle</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statut</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-sm">
                          {u.prenom.charAt(0)}{u.nom.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{u.prenom} {u.nom}</p>
                          <p className="text-xs text-muted-foreground">ID: {u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-zinc-300">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.actif ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
                          <ShieldAlert className="w-3.5 h-3.5" /> En attente
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {!u.actif && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(u.id)}
                          className="bg-green-500/20 hover:bg-green-500/30 text-green-400"
                        >
                          Approuver
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEdit(u)}
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-400/10"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Aucun utilisateur trouvé.
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Modifier l'utilisateur">
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Rôle</label>
            <select
              required
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
              value={editForm.role}
              onChange={e => setEditForm({ ...editForm, role: e.target.value })}
            >
              <option value="ADMIN">Administrateur</option>
              <option value="CHEF_MAINTENANCE">Chef de Maintenance</option>
              <option value="CHEF_TECHNICIEN">Chef Technicien</option>
              <option value="TECHNICIEN">Technicien</option>
              <option value="MAGASINIER">Magasinier</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Statut du compte</label>
            <select
              required
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
              value={editForm.actif ? 'true' : 'false'}
              onChange={e => setEditForm({ ...editForm, actif: e.target.value === 'true' })}
            >
              <option value="true">Actif (Autorisé à se connecter)</option>
              <option value="false">En attente / Désactivé</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={isUpdating} className="bg-purple-600 hover:bg-purple-700 text-white">
              {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
