import { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Clock, Activity } from 'lucide-react';
import { ApiResponse } from '@/types/api.types';

interface EquipementKpisModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipementId: number | null;
  equipementType: 'LIGNE' | 'POSTE' | null;
  equipementNom: string;
}

export function EquipementKpisModal({
  isOpen,
  onClose,
  equipementId,
  equipementType,
  equipementNom,
}: EquipementKpisModalProps) {
  const [kpis, setKpis] = useState<{ mtbf: number; mttr: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchKpis = useCallback(async () => {
    if (!equipementId || !equipementType) return;
    setIsLoading(true);
    try {
      const endpoint =
        equipementType === 'LIGNE'
          ? `/equipements/lignes/${equipementId}/kpis`
          : `/equipements/postes/${equipementId}/kpis`;
      const res = await api.get<ApiResponse<{ mtbf: number; mttr: number }>>(endpoint);
      setKpis(res.data || null);
    } catch (err: unknown) {
      toast.error('Erreur lors du chargement des KPIs');
    } finally {
      setIsLoading(false);
    }
  }, [equipementId, equipementType]);

  useEffect(() => {
    if (isOpen) {
      fetchKpis();
    }
  }, [isOpen, fetchKpis]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`KPIs: ${equipementNom}`}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Indicateurs de performance calculés sur l&apos;ensemble du cycle de vie de
          l&apos;équipement.
        </p>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <span className="text-muted-foreground animate-pulse">Chargement des KPIs...</span>
          </div>
        ) : kpis ? (
          <div className="grid grid-cols-2 gap-4">
            {/* MTTR */}
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
              <Clock className="w-8 h-8 text-blue-400 mb-2" />
              <div className="text-3xl font-bold text-white mb-1">
                {kpis.mttr.toFixed(1)}{' '}
                <span className="text-lg text-muted-foreground font-normal">h</span>
              </div>
              <div className="text-xs text-muted-foreground font-semibold tracking-wide uppercase">
                MTTR
              </div>
              <div className="text-[10px] text-muted-foreground/70 mt-1">
                Temps moyen de réparation
              </div>
            </div>

            {/* MTBF */}
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
              <Activity className="w-8 h-8 text-emerald-400 mb-2" />
              <div className="text-3xl font-bold text-white mb-1">
                {kpis.mtbf.toFixed(1)}{' '}
                <span className="text-lg text-muted-foreground font-normal">h</span>
              </div>
              <div className="text-xs text-muted-foreground font-semibold tracking-wide uppercase">
                MTBF
              </div>
              <div className="text-[10px] text-muted-foreground/70 mt-1">
                Temps moyen entre pannes
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground p-4">Aucune donnée disponible.</div>
        )}
      </div>
    </Modal>
  );
}
