'use client';

import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PlanningHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function PlanningHeader({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}: PlanningHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl p-6 md:p-8 shadow-xl">
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl" />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-violet-400" />
            Planning de Maintenance
          </h2>
          <p className="text-muted-foreground mt-2">
            Calendrier des interventions préventives et correctives planifiées.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-xl border border-white/[0.05]">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevMonth}
            className="hover:bg-white/[0.05]"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="w-32 text-center font-bold text-white capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            className="hover:bg-white/[0.05]"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
          <Button
            variant="secondary"
            onClick={onToday}
            className="ml-2 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30"
          >
            Aujourd&apos;hui
          </Button>
        </div>
      </div>
    </div>
  );
}
