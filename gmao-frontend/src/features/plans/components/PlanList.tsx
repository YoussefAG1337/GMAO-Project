'use client';

import { PlanCard } from './PlanCard';
import { Button } from '@/components/ui/button';
import { CalendarDays, Plus } from 'lucide-react';

interface PlanListProps {
  plans: any[];
  isAdmin: boolean;
  isAdminOrChef: boolean;
  onToggle: (id: number, actif: boolean) => void;
  onDelete: (id: number) => void;
  onTrigger: (id: number) => void;
  onEdit: (plan: any) => void;
  onViewDetail: (id: number) => void;
  onOpenCreate: () => void;
}

export function PlanList({
  plans,
  isAdmin,
  isAdminOrChef,
  onToggle,
  onDelete,
  onTrigger,
  onEdit,
  onViewDetail,
  onOpenCreate,
}: PlanListProps) {
  if (plans.length === 0) {
    return (
      <div className="py-24 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-white/[0.02] rounded-full flex items-center justify-center mb-4">
          <CalendarDays className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Aucun plan préventif</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Vous n&apos;avez pas encore configuré de maintenance préventive. Créez un plan pour
          automatiser la génération de vos ordres de travail.
        </p>
        {isAdminOrChef && (
          <Button onClick={onOpenCreate} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Créer le premier plan
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isAdmin={isAdmin}
          isAdminOrChef={isAdminOrChef}
          onToggle={onToggle}
          onDelete={onDelete}
          onTrigger={onTrigger}
          onEdit={onEdit}
          onViewDetail={onViewDetail}
        />
      ))}
    </div>
  );
}
