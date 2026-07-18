'use client';

import { TechnicianWorkrateEntry } from '@/types/analytics.types';
import { User } from 'lucide-react';

// Capacity limits in minutes
const DAILY_MAX = 7.5 * 60; // 450 min
const WEEKLY_MAX = 37.5 * 60; // 2250 min

// Given a value and a period-specific max, compute the load ratio and return
// the appropriate Tailwind color classes (background + text + bar fill).
function getLoadColor(minutes: number, max: number) {
  const ratio = max > 0 ? minutes / max : 0;
  if (ratio <= 0) return { bar: 'bg-zinc-700', text: 'text-zinc-400', bg: 'bg-zinc-800/40' };
  if (ratio < 0.7)
    return { bar: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  if (ratio <= 1) return { bar: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10' };
  return { bar: 'bg-rose-500', text: 'text-rose-400', bg: 'bg-rose-500/10' };
}

function formatMinutes(minutes: number): string {
  if (minutes === 0) return '0h';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function WorkratePill({ label, minutes, max }: { label: string; minutes: number; max: number }) {
  const { bar, text, bg } = getLoadColor(minutes, max);
  const pct = Math.min((minutes / max) * 100, 100);

  return (
    <div className={`flex-1 rounded-xl p-3 ${bg} border border-white/[0.04]`}>
      <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">{label}</p>
      <p className={`text-sm font-bold ${text}`}>{formatMinutes(minutes)}</p>
      <div className="mt-2 h-1 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface TechnicianWorkrateCardProps {
  tech: TechnicianWorkrateEntry;
  workingDaysInMonth: number;
}

export function TechnicianWorkrateCard({ tech, workingDaysInMonth }: TechnicianWorkrateCardProps) {
  const monthlyMax = workingDaysInMonth * DAILY_MAX;

  return (
    <div className="bg-zinc-950/50 border border-white/[0.06] rounded-2xl p-4 flex flex-col gap-3 hover:border-white/10 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-indigo-400" />
        </div>
        <span className="text-sm font-semibold text-white truncate">
          {tech.prenom} {tech.nom}
        </span>
      </div>
      <div className="flex gap-2">
        <WorkratePill label="Jour" minutes={tech.daily} max={DAILY_MAX} />
        <WorkratePill label="Semaine" minutes={tech.weekly} max={WEEKLY_MAX} />
        <WorkratePill label="Mois" minutes={tech.monthly} max={monthlyMax} />
      </div>
    </div>
  );
}
