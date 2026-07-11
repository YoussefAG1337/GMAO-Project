'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { format, subMonths } from 'date-fns';

const fetcher = (url: string) => api.get<any>(url).then((res) => res.data);

export function AnalyticsView() {
  const [dateRange, setDateRange] = useState({
    startDate: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const {
    data: analyticsResponse,
    isLoading,
    error,
  } = useSWR(`/analytics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, fetcher);

  if (error) {
    return (
      <Card className="bg-red-500/10 border-red-500/20 text-red-500 p-4">
        Erreur lors du chargement des analytiques : {error.message || 'Erreur inconnue'}
      </Card>
    );
  }

  const analytics = analyticsResponse;

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-card rounded-xl"></div>;
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Analyse des Performances (DI & OT)</h2>
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
              {analytics.timePerLigne.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  <span className="text-white font-medium">{item.ligne}</span>
                  <span className="text-indigo-400 font-bold">{item.averageTimeMinutes} min</span>
                </div>
              ))}
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
              {analytics.timePerPanne.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  <span className="text-white font-medium">{item.panne}</span>
                  <span className="text-rose-400 font-bold">{item.averageTimeMinutes} min</span>
                </div>
              ))}
              {analytics.timePerPanne.length === 0 && (
                <p className="text-muted-foreground text-sm">Aucune donnée.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
