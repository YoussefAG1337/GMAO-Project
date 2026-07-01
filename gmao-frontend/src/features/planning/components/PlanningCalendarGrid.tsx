'use client';

import { format, isSameMonth, isSameDay, isToday } from 'date-fns';

interface PlanningCalendarGridProps {
  daysInMonth: Date[];
  currentDate: Date;
  ots: any[];
  upcomingPlans: any[];
  onSelectDate: (date: Date) => void;
}

export function PlanningCalendarGrid({
  daysInMonth,
  currentDate,
  ots,
  upcomingPlans,
  onSelectDate,
}: PlanningCalendarGridProps) {
  return (
    <div className="border border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl overflow-hidden rounded-2xl shadow-xl">
      <div className="grid grid-cols-7 border-b border-white/[0.06] bg-white/[0.02]">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-bold text-muted-foreground/70 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr">
        {daysInMonth.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);

          const dayOTs = ots.filter((ot: any) => isSameDay(new Date(ot.datePrevue), day));
          const dayPlans = upcomingPlans.filter((p: any) =>
            isSameDay(new Date(p.prochaineExecution), day),
          );
          const totalEvents = dayOTs.length + dayPlans.length;

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(day)}
              className={`
                min-h-[100px] p-2 border-b border-r border-white/[0.04] cursor-pointer transition-colors
                hover:bg-white/[0.03] flex flex-col gap-1.5
                ${!isCurrentMonth ? 'opacity-40 bg-black/20' : ''}
                ${idx % 7 === 6 ? 'border-r-0' : ''} 
                ${idx >= 35 ? 'border-b-0' : ''}
              `}
            >
              <div className="flex justify-between items-start">
                <span
                  className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                  ${
                    isTodayDate
                      ? 'bg-violet-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.6)]'
                      : 'text-zinc-400'
                  }
                `}
                >
                  {format(day, 'd')}
                </span>
              </div>

              <div className="flex-1 flex flex-wrap gap-1 content-start overflow-hidden">
                {dayOTs.slice(0, 3).map((ot: any) => (
                  <div
                    key={ot.id}
                    title={ot.numeroOT}
                    className={`w-2 h-2 xl:w-auto xl:h-auto xl:px-1.5 xl:py-0.5 rounded-full text-[10px] font-bold truncate max-w-full
                      ${
                        ot.typeMaintenance === 'PREVENTIVE'
                          ? 'bg-emerald-500 xl:bg-emerald-500/20 xl:text-emerald-400'
                          : 'bg-rose-500 xl:bg-rose-500/20 xl:text-rose-400'
                      }
                    `}
                  >
                    <span className="hidden xl:inline">{ot.numeroOT}</span>
                  </div>
                ))}

                {dayPlans.slice(0, Math.max(0, 3 - dayOTs.length)).map((p: any) => (
                  <div
                    key={`p-${p.id}`}
                    title={p.intitule}
                    className="w-2 h-2 xl:w-auto xl:h-auto xl:px-1.5 xl:py-0.5 rounded-full border border-dashed border-violet-400 text-[10px] text-violet-400 font-bold truncate max-w-full"
                  >
                    <span className="hidden xl:inline">Plan</span>
                  </div>
                ))}

                {totalEvents > 3 && (
                  <div className="text-[10px] text-muted-foreground font-bold w-full text-center mt-0.5">
                    +{totalEvents - 3}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
