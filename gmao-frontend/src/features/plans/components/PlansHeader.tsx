'use client';

import { Button } from '@/components/ui/button';
import { CalendarRange, Plus } from 'lucide-react';

interface PlansHeaderProps {
  isAdminOrChef: boolean;
  onOpenCreate: () => void;
}

export function PlansHeader({ isAdminOrChef, onOpenCreate }: PlansHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl p-6 md:p-8 shadow-xl">
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <CalendarRange className="w-8 h-8 text-emerald-400" />
            Plans Préventifs
          </h2>
          <p className="text-muted-foreground mt-2">
            Génération automatique des interventions de maintenance régulières.
          </p>
        </div>
        {isAdminOrChef && (
          <Button
            onClick={onOpenCreate}
            className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Plan
          </Button>
        )}
      </div>
    </div>
  );
}
