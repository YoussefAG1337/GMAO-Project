'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { EquipmentSelect } from '@/components/EquipmentSelect';

interface OtFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  formData: any;
  setFormData: (data: any) => void;
  ateliers: any[];
  lignes: any[];
  postes: any[];
}

export function OtFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  ateliers,
  lignes,
  postes,
}: OtFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer un Ordre de Travail">
      <form onSubmit={onSubmit} className="space-y-4">
        <EquipmentSelect
          formData={formData}
          setFormData={setFormData}
          ateliers={ateliers}
          lignes={lignes}
          postes={postes}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">
            Description de l&apos;intervention
          </label>
          <textarea
            required
            rows={3}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Type</label>
            <select
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
              value={formData.typeMaintenance}
              onChange={(e) => setFormData({ ...formData, typeMaintenance: e.target.value })}
            >
              <option value="CORRECTIVE">Corrective</option>
              <option value="PREVENTIVE">Préventive</option>
              <option value="AMELIORATIVE">Améliorative</option>
            </select>
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
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Date prévue</label>
          <input
            type="date"
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
            value={formData.datePrevue}
            onChange={(e) => setFormData({ ...formData, datePrevue: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
            Créer l&apos;OT
          </Button>
        </div>
      </form>
    </Modal>
  );
}
