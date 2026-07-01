'use client';

import { Modal } from '@/components/ui/modal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { freqLabels, statusColors } from '../lib/constants';

interface PlanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  detailPlanData: any;
}

export function PlanDetailModal({ isOpen, onClose, detailPlanData }: PlanDetailModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails du Plan Préventif">
      {!detailPlanData ? (
        <div className="p-8 text-center text-muted-foreground">Chargement...</div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">{detailPlanData.intitule}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {detailPlanData.description || 'Aucune description'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
            <div>
              <div className="text-xs text-muted-foreground">Fréquence</div>
              <div className="font-semibold text-emerald-400 text-sm mt-1">
                {freqLabels[detailPlanData.frequence]}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Statut</div>
              <div className="font-semibold text-white text-sm mt-1">
                {detailPlanData.actif ? 'Actif' : 'Inactif'}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Dernière exécution</div>
              <div className="font-semibold text-white text-sm mt-1">
                {detailPlanData.dernierExecution
                  ? format(new Date(detailPlanData.dernierExecution), 'dd MMM yyyy', {
                      locale: fr,
                    })
                  : '-'}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Prochaine exécution</div>
              <div className="font-semibold text-emerald-400 text-sm mt-1">
                {detailPlanData.prochaineExecution
                  ? format(new Date(detailPlanData.prochaineExecution), 'dd MMM yyyy', {
                      locale: fr,
                    })
                  : '-'}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Historique des OTs (Générés)
            </h4>
            {detailPlanData.ordresTravail?.length > 0 ? (
              <div className="space-y-2">
                {detailPlanData.ordresTravail.map((ot: any) => (
                  <div
                    key={ot.id}
                    className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-sm">{ot.numeroOT}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          statusColors[ot.statut] || 'bg-gray-500/10 text-gray-400'
                        }`}
                      >
                        {ot.statut.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>
                        Prévu le:{' '}
                        {ot.datePrevue ? format(new Date(ot.datePrevue), 'dd/MM/yyyy') : '-'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground p-4 bg-white/[0.01] rounded-xl border border-white/[0.02] text-center">
                Aucun OT n&apos;a encore été généré par ce plan.
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
