'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface OtRapportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  rapportData: any;
  setRapportData: (data: any) => void;
  magasinPieces?: any[];
}

export function OtRapportModal({
  isOpen,
  onClose,
  onSubmit,
  rapportData,
  setRapportData,
  magasinPieces = [],
}: OtRapportModalProps) {
  const handleAddPiece = () => {
    const pieces = rapportData.piecesUtilisees || [];
    setRapportData({ ...rapportData, piecesUtilisees: [...pieces, { pieceId: 0, quantite: 1 }] });
  };

  const handleUpdatePiece = (index: number, field: string, value: number) => {
    const pieces = [...(rapportData.piecesUtilisees || [])];
    pieces[index] = { ...pieces[index], [field]: value };
    setRapportData({ ...rapportData, piecesUtilisees: pieces });
  };

  const handleRemovePiece = (index: number) => {
    const pieces = [...(rapportData.piecesUtilisees || [])];
    pieces.splice(index, 1);
    setRapportData({ ...rapportData, piecesUtilisees: pieces });
  };
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
          <label className="text-sm font-medium text-white">Description (optionnel)</label>
          <input
            type="text"
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
            value={rapportData.description || ''}
            onChange={(e) => setRapportData({ ...rapportData, description: e.target.value })}
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
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white">Pièces utilisées (Magasin)</label>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleAddPiece}
              className="text-emerald-400 hover:text-emerald-300"
            >
              + Ajouter
            </Button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {(rapportData.piecesUtilisees || []).map((p: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <select
                  required
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-lg p-2 text-white"
                  value={p.pieceId}
                  onChange={(e) => handleUpdatePiece(idx, 'pieceId', Number(e.target.value))}
                >
                  <option value={0} disabled>
                    Sélectionner une pièce
                  </option>
                  {magasinPieces.map((mp) => (
                    <option key={mp.id} value={mp.id}>
                      {mp.nom} ({mp.code})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-20 bg-zinc-900 border border-white/10 rounded-lg p-2 text-white"
                  value={p.quantite}
                  onChange={(e) => handleUpdatePiece(idx, 'quantite', Number(e.target.value))}
                />
                <button
                  type="button"
                  onClick={() => handleRemovePiece(idx)}
                  className="text-rose-400 p-2 hover:bg-rose-400/10 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
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
