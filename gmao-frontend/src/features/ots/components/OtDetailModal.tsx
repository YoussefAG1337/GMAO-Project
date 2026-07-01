'use client';

import { Modal } from '@/components/ui/modal';

interface OtDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: any;
}

export function OtDetailModal({ isOpen, onClose, selectedItem }: OtDetailModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails de l'Ordre de Travail">
      {selectedItem && (
        <div className="space-y-4 text-sm text-white">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground block text-xs">Numéro</span>{' '}
                {selectedItem.numeroOT}
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Statut</span>{' '}
                {selectedItem.statut}
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Type</span>{' '}
                {selectedItem.typeMaintenance}
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Priorité</span>{' '}
                {selectedItem.priorite}
              </div>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs mb-1">Description</span>
            <p className="bg-zinc-900 p-3 rounded-lg border border-white/5">
              {selectedItem.description || 'N/A'}
            </p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <span className="text-muted-foreground block text-xs mb-2">Localisation</span>
            <p>
              📍 {selectedItem.atelier?.nom} &rsaquo; {selectedItem.ligne?.nom} &rsaquo;{' '}
              {selectedItem.poste?.nom}
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
