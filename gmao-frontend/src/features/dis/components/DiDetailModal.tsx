'use client';

import { Modal } from '@/components/ui/modal';

import { Di } from '@/types/di.types';

interface DiDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: Di | null;
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
                <span className="text-muted-foreground block text-xs">Produit Concerné</span>{' '}
                {selectedItem.produit?.nom || 'Aucun'}
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Panne</span>{' '}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span>{selectedItem.panne?.nom || 'Non spécifiée'}</span>
                  {selectedItem.panne?.type && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-medium ${
                        selectedItem.panne.type === 'QUALITE'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {selectedItem.panne.type === 'QUALITE' ? 'Qualité' : 'Technique'}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Technicien</span>{' '}
                {selectedItem.technicien
                  ? `${selectedItem.technicien.prenom} ${selectedItem.technicien.nom}`
                  : 'Non assigné'}
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Déclaré par</span>{' '}
                {selectedItem.declarePar
                  ? `${selectedItem.declarePar.prenom} ${selectedItem.declarePar.nom}`
                  : 'Inconnu'}
              </div>
            </div>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <span className="text-muted-foreground block text-xs mb-2">Localisation</span>
            <p>
              📍 {selectedItem.atelier?.nom} &rsaquo; {selectedItem.ligne?.nom} &rsaquo;{' '}
              {selectedItem.poste?.nom}
            </p>
          </div>

          {selectedItem.documentUtileUrl && (
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="text-muted-foreground block text-xs mb-2">Fichier joint</span>
              <a
                href={selectedItem.documentUtileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline flex items-center gap-2"
              >
                📄 Voir le document
              </a>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
