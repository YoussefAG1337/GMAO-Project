'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface DiEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  editFormData: any;
  setEditFormData: (data: any) => void;
}

export function DiEditModal({
  isOpen,
  onClose,
  onSubmit,
  editFormData,
  setEditFormData,
}: DiEditModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier la Demande d'Intervention">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Titre / Produit</label>
          <input
            type="text"
            required
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
            value={editFormData.produit}
            onChange={(e) => setEditFormData({ ...editFormData, produit: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Description détaillée</label>
          <textarea
            required
            rows={4}
            minLength={10}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
            value={editFormData.description}
            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Priorité</label>
          <select
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
            value={editFormData.priorite}
            onChange={(e) => setEditFormData({ ...editFormData, priorite: e.target.value })}
          >
            <option value="BASSE">Basse</option>
            <option value="MOYENNE">Moyenne</option>
            <option value="HAUTE">Haute</option>
            <option value="CRITIQUE">Critique</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white">
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
