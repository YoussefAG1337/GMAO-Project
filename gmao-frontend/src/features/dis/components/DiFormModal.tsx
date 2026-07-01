'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface DiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  formData: any;
  setFormData: (data: any) => void;
  ateliers: any[];
  lignes: any[];
  postes: any[];
}

export function DiFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  ateliers,
  lignes,
  postes,
}: DiFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Signaler un incident">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Atelier</label>
            <select
              required
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
              value={formData.atelierId}
              onChange={(e) => setFormData({ ...formData, atelierId: e.target.value })}
            >
              <option value="">Sélectionner</option>
              {ateliers?.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Ligne</label>
            <select
              required
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
              value={formData.ligneId}
              onChange={(e) => setFormData({ ...formData, ligneId: e.target.value })}
            >
              <option value="">Sélectionner</option>
              {lignes
                ?.filter(
                  (l: any) => !formData.atelierId || l.atelierId === Number(formData.atelierId),
                )
                .map((l: any) => (
                  <option key={l.id} value={l.id}>
                    {l.nom}
                  </option>
                ))}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-white">Poste (Équipement)</label>
            <select
              required
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
              value={formData.posteId}
              onChange={(e) => setFormData({ ...formData, posteId: e.target.value })}
            >
              <option value="">Sélectionner</option>
              {postes
                ?.filter((p: any) => !formData.ligneId || p.ligneId === Number(formData.ligneId))
                .map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.nom}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Titre / Produit</label>
          <input
            type="text"
            required
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
            placeholder="Ex: Surchauffe moteur"
            value={formData.produit}
            onChange={(e) => setFormData({ ...formData, produit: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Description détaillée</label>
          <textarea
            required
            rows={4}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
            placeholder="Décrivez le problème constaté..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Priorité</label>
          <select
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
            value={formData.priorite}
            onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
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
            Soumettre la DI
          </Button>
        </div>
      </form>
    </Modal>
  );
}
