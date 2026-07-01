'use client';

export function PlanningLegend() {
  return (
    <div className="flex flex-wrap gap-4 items-center text-xs text-muted-foreground font-medium px-2">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
        OT Préventif
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
        OT Correctif
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full border-2 border-dashed border-violet-400"></div>
        Planifié (Non généré)
      </div>
    </div>
  );
}
