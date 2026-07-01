'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Zap, Eye, Clock, Power, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { freqLabels } from '../lib/constants';

interface PlanCardProps {
  plan: any;
  isAdmin: boolean;
  isAdminOrChef: boolean;
  onToggle: (id: number, actif: boolean) => void;
  onDelete: (id: number) => void;
  onTrigger: (id: number) => void;
  onEdit: (plan: any) => void;
  onViewDetail: (id: number) => void;
}

export function PlanCard({
  plan,
  isAdmin,
  isAdminOrChef,
  onToggle,
  onDelete,
  onTrigger,
  onEdit,
  onViewDetail,
}: PlanCardProps) {
  return (
    <Card className="border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl hover:border-emerald-500/30 transition-all shadow-lg flex flex-col">
      <CardContent className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <RefreshCw className={`w-6 h-6 ${plan.actif ? 'animate-spin-slow' : ''}`} />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                plan.actif
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
              }`}
            >
              {plan.actif ? 'Actif' : 'Inactif'}
            </span>
            {isAdminOrChef && plan.actif && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onTrigger(plan.id)}
                className="bg-violet-500/10 text-violet-400 hover:bg-violet-500/20"
                title="Générer OT maintenant"
              >
                <Zap className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        <h3
          className="text-lg font-bold text-white leading-tight cursor-pointer hover:text-emerald-400 transition-colors flex items-center gap-2"
          onClick={() => onViewDetail(plan.id)}
        >
          {plan.intitule}
          <Eye className="w-4 h-4 text-muted-foreground opacity-50" />
        </h3>
        <p className="text-xs text-emerald-400/80 font-bold uppercase tracking-wider mt-2 mb-3">
          {freqLabels[plan.frequence] || plan.frequence}
        </p>

        <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl space-y-2 mt-auto">
          <div className="text-xs text-muted-foreground flex justify-between">
            <span>Cible:</span>
            <span
              className="text-white text-right max-w-[150px] truncate"
              title={`${plan.atelier?.nom} > ${plan.poste?.nom}`}
            >
              {plan.poste?.nom}
            </span>
          </div>
          <div className="text-xs text-muted-foreground flex justify-between">
            <span>Prochaine exécution:</span>
            <span className="text-emerald-300 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {plan.prochaineExecution
                ? format(new Date(plan.prochaineExecution), 'dd MMM yyyy', { locale: fr })
                : '-'}
            </span>
          </div>
        </div>

        {isAdminOrChef && (
          <div className="mt-4 flex gap-2 pt-4 border-t border-white/[0.06]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(plan)}
              className="flex-1 text-muted-foreground hover:text-white hover:bg-white/[0.05]"
            >
              Modifier
            </Button>
            <Button
              onClick={() => onToggle(plan.id, plan.actif)}
              variant="ghost"
              size="sm"
              className={`flex-1 ${
                plan.actif
                  ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10'
              }`}
            >
              <Power className="w-4 h-4 mr-2" /> {plan.actif ? 'Désactiver' : 'Activer'}
            </Button>
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDelete(plan.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
