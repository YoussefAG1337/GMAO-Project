'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PlanningDayModalProps {
  selectedDate: Date | null;
  onClose: () => void;
  selectedDayOTs: any[];
  selectedDayPlans: any[];
  isAdminOrChef: boolean;
  onGenerateNow: (planId: number) => void;
}

export function PlanningDayModal({
  selectedDate,
  onClose,
  selectedDayOTs,
  selectedDayPlans,
  isAdminOrChef,
  onGenerateNow,
}: PlanningDayModalProps) {
  return (
    <Modal
      isOpen={!!selectedDate}
      onClose={onClose}
      title={selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : ''}
    >
      <div className="space-y-6">
        {selectedDayOTs.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Ordres de Travail ({selectedDayOTs.length})
            </h4>
            <div className="space-y-2">
              {selectedDayOTs.map((ot: any) => (
                <div
                  key={ot.id}
                  className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">{ot.numeroOT}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase
                      ${
                        ot.typeMaintenance === 'PREVENTIVE'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }
                    `}
                    >
                      {ot.typeMaintenance}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Cible: <span className="text-zinc-300 font-medium">{ot.poste?.nom}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Assigné à:{' '}
                    <span className="text-zinc-300">
                      {ot.technicien
                        ? `${ot.technicien.prenom} ${ot.technicien.nom}`
                        : 'Non assigné'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedDayPlans.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full border-2 border-dashed border-violet-400"></span>
              Planifiés / Non générés ({selectedDayPlans.length})
            </h4>
            <div className="space-y-2">
              {selectedDayPlans.map((plan: any) => (
                <div
                  key={plan.id}
                  className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col gap-3"
                >
                  <div>
                    <div className="font-bold text-white text-sm leading-tight">
                      {plan.intitule}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Cible: {plan.poste?.nom}
                    </div>
                  </div>

                  {isAdminOrChef && (
                    <Button
                      size="sm"
                      className="w-full bg-violet-600 hover:bg-violet-500 text-white"
                      onClick={() => onGenerateNow(plan.id)}
                    >
                      <Play className="w-3.5 h-3.5 mr-2" />
                      Générer maintenant
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedDayOTs.length === 0 && selectedDayPlans.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Aucune intervention planifiée à cette date.
          </div>
        )}
      </div>
    </Modal>
  );
}
