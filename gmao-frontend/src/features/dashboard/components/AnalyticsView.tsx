'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { format, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAnalytics } from '@/features/dashboard/hooks/useAnalytics';
import { useWorkrates } from '@/features/dashboard/hooks/useWorkrates';
import { TechnicianWorkrateCard } from '@/features/dashboard/components/TechnicianWorkrateCard';
import { useAuth } from '@/context/AuthContext';
import { Users } from 'lucide-react';

function workingDaysInMonth(dateStr: string): number {
  const anchor = new Date(dateStr);
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const day = new Date(year, month, d).getDay();
    if (day !== 0 && day !== 6) count++; // exclude Sun (0) and Sat (6)
  }
  return count;
}

export function AnalyticsView() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isAdminOrChef = isAdmin || user?.role === 'CHEF_MAINTENANCE';

  const [dateRange, setDateRange] = useState({
    startDate: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  // Workrate anchor defaults to today
  const [anchorDate, setAnchorDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { analytics, isLoading, error } = useAnalytics(dateRange.startDate, dateRange.endDate);

  const {
    workrateData,
    isLoading: workrateLoading,
    error: workrateError,
  } = useWorkrates(isAdminOrChef ? anchorDate : '');

  if (error) {
    return (
      <Card className="bg-red-500/10 border-red-500/20 text-red-500 p-4">
        Erreur lors du chargement des analytiques : {error.message || 'Erreur inconnue'}
      </Card>
    );
  }

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-card rounded-xl"></div>;
  }

  if (!analytics) return null;

  const wdim = workingDaysInMonth(anchorDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Analyse des Performances (DI &amp; OT)</h2>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
            className="bg-background border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
            className="bg-background border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Cards */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Total DI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{analytics.totalDI}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Taux de Conversion (DI &rarr; OT)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">{analytics.conversionRate}%</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              DI (En cours / Clôturées)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">
              <span className="text-amber-400">{analytics.di.enCours}</span>
              <span className="text-muted-foreground mx-2">/</span>
              <span className="text-emerald-400">{analytics.di.cloture}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              OT (En cours / Clôturés)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">
              <span className="text-amber-400">{analytics.ot.enCours}</span>
              <span className="text-muted-foreground mx-2">/</span>
              <span className="text-emerald-400">{analytics.ot.cloture}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temps moyen par ligne */}
        <Card className="bg-card ring-1 ring-foreground/10">
          <CardHeader>
            <CardTitle>Temps moyen d&apos;intervention par Ligne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.timePerLigne.map(
                (item: { ligne: string; averageTimeMinutes: number }, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02] border border-white/5"
                  >
                    <span className="text-white font-medium">{item.ligne}</span>
                    <span className="text-indigo-400 font-bold">{item.averageTimeMinutes} min</span>
                  </div>
                ),
              )}
              {analytics.timePerLigne.length === 0 && (
                <p className="text-muted-foreground text-sm">Aucune donnée.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Temps moyen par panne */}
        <Card className="bg-card ring-1 ring-foreground/10">
          <CardHeader>
            <CardTitle>Temps moyen d&apos;intervention par Panne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.timePerPanne.map(
                (item: { panne: string; averageTimeMinutes: number }, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02] border border-white/5"
                  >
                    <span className="text-white font-medium">{item.panne}</span>
                    <span className="text-rose-400 font-bold">{item.averageTimeMinutes} min</span>
                  </div>
                ),
              )}
              {analytics.timePerPanne.length === 0 && (
                <p className="text-muted-foreground text-sm">Aucune donnée.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {isAdminOrChef && (
        <div className="space-y-4">
          {/* Section header + date anchor picker */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Taux de Travail — Techniciens</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Date de référence :</span>
              <input
                type="date"
                value={anchorDate}
                onChange={(e) => setAnchorDate(e.target.value)}
                className="bg-background border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
              />
            </div>
          </div>
          {workrateError && (
            <p className="text-rose-400 text-sm">Erreur lors du chargement des taux de travail.</p>
          )}

          {workrateLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse h-28 bg-zinc-900 rounded-2xl" />
              ))}
            </div>
          )}

          {!workrateLoading && workrateData && (
            <>
              {/* Windows metadata */}
              <p className="text-[11px] text-zinc-600">
                Semaine : {new Date(workrateData.windows.week.start).toLocaleDateString('fr-FR')}
                {' – '}
                {new Date(workrateData.windows.week.end).toLocaleDateString('fr-FR')}
                {'  ·  '}
                Mois :{' '}
                {new Date(workrateData.windows.month.start).toLocaleDateString('fr-FR', {
                  month: 'long',
                  year: 'numeric',
                })}
                {' ('}
                {wdim} jours ouvrés, max {(wdim * 7.5).toFixed(0)} h{')'}
              </p>

              {workrateData.technicians.length === 0 ? (
                <p className="text-zinc-500 text-sm py-4">Aucun technicien actif trouvé.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workrateData.technicians.map((tech) => (
                    <TechnicianWorkrateCard key={tech.id} tech={tech} workingDaysInMonth={wdim} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
