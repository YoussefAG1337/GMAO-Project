'use client';

import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  formData: any;
  setFormData: (data: any) => void;
  isEditing: boolean;
  ateliers: any[];
  lignes: any[];
  postes: any[];
}

export function PlanFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEditing,
  ateliers,
  lignes,
  postes,
}: PlanFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modifier le Plan' : 'Créer un Plan de Maintenance'}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Intitulé du plan</label>
          <Input
            type="text"
            required
            placeholder="Ex: Entretien mensuel compresseur"
            value={formData.intitule}
            onChange={(e) => setFormData({ ...formData, intitule: e.target.value })}
          />
        </div>

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
            <label className="text-sm font-medium text-white">Poste (Équipement cible)</label>
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
          <label className="text-sm font-medium text-white">Description et instructions</label>
          <textarea
            rows={3}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Fréquence</label>
            <select
              required
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
              value={formData.frequence}
              onChange={(e) => setFormData({ ...formData, frequence: e.target.value })}
            >
              <option value="HEBDOMADAIRE">Hebdomadaire</option>
              <option value="MENSUELLE">Mensuelle</option>
              <option value="TRIMESTRIELLE">Trimestrielle</option>
              <option value="SEMESTRIELLE">Semestrielle</option>
              <option value="ANNUELLE">Annuelle</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Première/Prochaine exécution</label>
            <Input
              type="date"
              required={!isEditing}
              value={formData.prochaineExecution}
              onChange={(e) => setFormData({ ...formData, prochaineExecution: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">
            {isEditing ? 'Enregistrer' : 'Créer le Plan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
