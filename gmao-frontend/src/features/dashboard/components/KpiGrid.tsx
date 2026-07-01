'use client';

import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Wrench, FileText, Activity } from 'lucide-react';

interface KpiGridProps {
  stats: any;
  kpis: any;
  loading: boolean;
}

export function KpiGrid({ stats, kpis, loading }: KpiGridProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60 px-1">
        Indicateurs Clés {loading ? '(Chargement...)' : ''}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-white/[0.06] bg-zinc-950/45 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/30 hover:shadow-amber-500/10 shadow-lg shadow-black/30 group">
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground/80 tracking-wide uppercase">
                Incidents Ouverts (DI)
              </span>
              <div className="p-2 rounded-xl border bg-amber-500/10 text-amber-400 border-amber-500/20 transform group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold tracking-tight text-white mb-1">
                {stats?.incidentsOuverts || 0}
              </div>
              <p className="text-xs text-muted-foreground/70 font-medium">Demandes en attente</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-white/[0.06] bg-zinc-950/45 backdrop-blur-xl transition-all duration-300 hover:border-[#651FAA]/30 hover:shadow-[#651FAA]/10 shadow-lg shadow-black/30 group">
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground/80 tracking-wide uppercase">
                OTs En Cours
              </span>
              <div className="p-2 rounded-xl border bg-[#651FAA]/10 text-purple-300 border-[#651FAA]/20 transform group-hover:scale-110 transition-transform duration-300">
                <Wrench className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold tracking-tight text-white mb-1">
                {stats?.otEnCours || 0}
              </div>
              <p className="text-xs text-muted-foreground/70 font-medium">Interventions actives</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-white/[0.06] bg-zinc-950/45 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/30 hover:shadow-blue-500/10 shadow-lg shadow-black/30 group">
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground/80 tracking-wide uppercase">
                OTs à Valider
              </span>
              <div className="p-2 rounded-xl border bg-blue-500/10 text-blue-400 border-blue-500/20 transform group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold tracking-tight text-white mb-1">
                {stats?.otEnAttenteValidation || 0}
              </div>
              <p className="text-xs text-muted-foreground/70 font-medium">En attente de clôture</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-white/[0.06] bg-zinc-950/45 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/30 hover:shadow-emerald-500/10 shadow-lg shadow-black/30 group">
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground/80 tracking-wide uppercase">
                Disponibilité (TRS)
              </span>
              <div className="p-2 rounded-xl border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 transform group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold tracking-tight text-white mb-1">
                {kpis ? `${kpis.disponibilite.toFixed(1)}%` : '--'}
              </div>
              <p className="text-xs text-muted-foreground/70 font-medium">
                Disponibilité globale usine
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
