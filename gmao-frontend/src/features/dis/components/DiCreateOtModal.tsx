'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface DiCreateOtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  otFormData: any;
  setOtFormData: (data: any) => void;
  techniciens: any[];
}

export function DiCreateOtModal({
  isOpen,
  onClose,
  onSubmit,
  otFormData,
  setOtFormData,
  techniciens,
}: DiCreateOtModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Générer un Ordre de Travail">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">
            Description de l&apos;intervention
          </label>
          <textarea
            required
            rows={3}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
            value={otFormData.description}
            onChange={(e) => setOtFormData({ ...otFormData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Type de maintenance</label>
            <select
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
              value={otFormData.typeMaintenance}
              onChange={(e) => setOtFormData({ ...otFormData, typeMaintenance: e.target.value })}
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
              value={otFormData.priorite}
              onChange={(e) => setOtFormData({ ...otFormData, priorite: e.target.value })}
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
              value={otFormData.technicienId}
              onChange={(e) => setOtFormData({ ...otFormData, technicienId: e.target.value })}
            >
              <option value="">Non assigné</option>
              {techniciens.map((tech: any) => (
                <option key={tech.id} value={tech.id}>
                  {tech.prenom} {tech.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Date prévue</label>
            <input
              type="date"
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
              value={otFormData.datePrevue}
              onChange={(e) => setOtFormData({ ...otFormData, datePrevue: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" className="bg-[#651FAA] hover:bg-purple-600 text-white">
            Créer l&apos;OT
          </Button>
        </div>
      </form>
    </Modal>
  );
}
