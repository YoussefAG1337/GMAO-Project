'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import useSWR from 'swr';
import { api } from '@/lib/api';

const fetcher = (url: string) =>
  api.get<any>(url).then((res) => (res.data !== undefined ? res.data : res));

interface UtilisateurEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  editForm: { role: string; actif: boolean; lignes?: number[] };
  setEditForm: (data: { role: string; actif: boolean; lignes?: number[] }) => void;
  isUpdating: boolean;
}

export function UtilisateurEditModal({
  isOpen,
  onClose,
  onSubmit,
  editForm,
  setEditForm,
  isUpdating,
}: UtilisateurEditModalProps) {
  const { data: lignesResult } = useSWR(isOpen ? '/equipements/lignes' : null, fetcher);
  const lignes = lignesResult?.data || [];

  const handleLigneToggle = (ligneId: number) => {
    const currentLignes = editForm.lignes || [];
    const newLignes = currentLignes.includes(ligneId)
      ? currentLignes.filter((id) => id !== ligneId)
      : [...currentLignes, ligneId];
    setEditForm({ ...editForm, lignes: newLignes });
  };

  const showLignesSelection = editForm.role === 'TECHNICIEN' || editForm.role === 'CHEF_TECHNICIEN';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier l'utilisateur">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Rôle</label>
          <select
            required
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
            value={editForm.role}
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
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
            onChange={(e) => setEditForm({ ...editForm, actif: e.target.value === 'true' })}
          >
            <option value="true">Actif (Autorisé à se connecter)</option>
            <option value="false">En attente / Désactivé</option>
          </select>
        </div>

        {showLignesSelection && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Lignes Assignées</label>
            <div className="max-h-40 overflow-y-auto bg-zinc-900 border border-white/10 rounded-lg p-2 space-y-2">
              {lignes.map((ligne: any) => (
                <label key={ligne.id} className="flex items-center space-x-2 text-white">
                  <input
                    type="checkbox"
                    className="rounded bg-zinc-800 border-white/20 text-purple-600 focus:ring-purple-600"
                    checked={(editForm.lignes || []).includes(ligne.id)}
                    onChange={() => handleLigneToggle(ligne.id)}
                  />
                  <span>{ligne.nom}</span>
                </label>
              ))}
              {lignes.length === 0 && (
                <span className="text-sm text-gray-400">Aucune ligne disponible</span>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isUpdating}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
