'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface OtRapportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  rapportData: any;
  setRapportData: (data: any) => void;
}

export function OtRapportModal({
  isOpen,
  onClose,
  onSubmit,
  rapportData,
  setRapportData,
}: OtRapportModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Soumettre un rapport d'intervention">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Diagnostic</label>
          <textarea
            required
            rows={2}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
            value={rapportData.diagnostic}
            onChange={(e) => setRapportData({ ...rapportData, diagnostic: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Cause de la panne (optionnel)</label>
          <input
            type="text"
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
            value={rapportData.causePanne}
            onChange={(e) => setRapportData({ ...rapportData, causePanne: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Actions réalisées</label>
          <textarea
            required
            rows={3}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
            value={rapportData.actionsRealisees}
            onChange={(e) => setRapportData({ ...rapportData, actionsRealisees: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Temps d&apos;intervention (minutes)
            </label>
            <input
              type="number"
              required
              min="1"
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
              value={rapportData.tempsIntervention}
              onChange={(e) =>
                setRapportData({ ...rapportData, tempsIntervention: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Temps d&apos;arrêt machine (minutes)
            </label>
            <input
              type="number"
              min="0"
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
              value={rapportData.tempsArret}
              onChange={(e) => setRapportData({ ...rapportData, tempsArret: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Pièces utilisées (optionnel)</label>
          <input
            type="text"
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
            placeholder="Ex: Filtre à huile, 2 vis M8"
            value={rapportData.piecesUtilisees}
            onChange={(e) => setRapportData({ ...rapportData, piecesUtilisees: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white">
            Soumettre
          </Button>
        </div>
      </form>
    </Modal>
  );
}
