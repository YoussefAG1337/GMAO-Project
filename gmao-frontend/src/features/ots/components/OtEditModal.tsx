'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface OtEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  editFormData: any;
  setEditFormData: (data: any) => void;
  techniciens: any[];
}

export function OtEditModal({
  isOpen,
  onClose,
  onSubmit,
  editFormData,
  setEditFormData,
  techniciens,
}: OtEditModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier l'Ordre de Travail">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">
            Description de l&apos;intervention
          </label>
          <textarea
            required
            rows={3}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
            value={editFormData.description}
            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Technicien</label>
            <select
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
              value={editFormData.technicienId}
              onChange={(e) => setEditFormData({ ...editFormData, technicienId: e.target.value })}
            >
              <option value="">Non assigné</option>
              {techniciens.map((tech: any) => (
                <option key={tech.id} value={tech.id}>
                  {tech.prenom} {tech.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-white">Date prévue</label>
            <input
              type="date"
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
              value={editFormData.datePrevue}
              onChange={(e) => setEditFormData({ ...editFormData, datePrevue: e.target.value })}
            />
          </div>
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
