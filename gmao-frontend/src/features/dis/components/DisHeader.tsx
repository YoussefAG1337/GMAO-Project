'use client';

import { Button } from '@/components/ui/button';
import { MessageSquareWarning, Plus } from 'lucide-react';

interface DisHeaderProps {
  onOpenCreate: () => void;
}

export function DisHeader({ onOpenCreate }: DisHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl p-6 md:p-8 shadow-xl">
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <MessageSquareWarning className="w-8 h-8 text-amber-400" />
            Demandes d&apos;Intervention (DI)
          </h2>
          <p className="text-muted-foreground mt-2">
            Gestion des signalements de pannes et incidents.
          </p>
        </div>
        <Button
          onClick={onOpenCreate}
          className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          Signaler un incident
        </Button>
      </div>
    </div>
  );
}
