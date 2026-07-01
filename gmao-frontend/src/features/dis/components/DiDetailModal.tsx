'use client';

import { Modal } from '@/components/ui/modal';

interface DiDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: any;
}

export function DiDetailModal({ isOpen, onClose, selectedItem }: DiDetailModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails de la Demande d'Intervention">
      {selectedItem && (
        <div className="space-y-4 text-sm text-white">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground block text-xs">Numéro</span>{' '}
                {selectedItem.numeroDI}
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Statut</span>{' '}
                {selectedItem.statut}
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Titre</span>{' '}
                {selectedItem.produit || 'N/A'}
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
              {selectedItem.description}
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
