'use client';

import { Button } from '@/components/ui/button';
import { Wrench, Plus } from 'lucide-react';

interface OtsHeaderProps {
  isAdminOrChefTech: boolean;
  onOpenCreate: () => void;
}

export function OtsHeader({ isAdminOrChefTech, onOpenCreate }: OtsHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl p-6 md:p-8 shadow-xl">
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Wrench className="w-8 h-8 text-blue-400" />
            Ordres de Travail (OT)
          </h2>
          <p className="text-muted-foreground mt-2">
            Suivi et exécution des interventions de maintenance.
          </p>
        </div>
        {isAdminOrChefTech && (
          <Button
            onClick={onOpenCreate}
            className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer un OT
          </Button>
        )}
      </div>
    </div>
  );
}
