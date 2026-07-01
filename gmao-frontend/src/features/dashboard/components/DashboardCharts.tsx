'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface DashboardChartsProps {
  stats: any;
  loading: boolean;
}

export function DashboardCharts({ stats, loading }: DashboardChartsProps) {
  const repartitionData = stats
    ? [
        {
          name: 'Corrective',
          value: stats.repartitionCorrectivePreventive.corrective,
          color: '#f43f5e',
        },
        {
          name: 'Préventive',
          value: stats.repartitionCorrectivePreventive.preventive,
          color: '#10b981',
        },
      ]
    : [];

  const barData = stats
    ? stats.pannesParLigne.map((p: any) => ({
        name: p.ligneNom,
        pannes: p.count,
      }))
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl shadow-lg shadow-black/20 overflow-hidden">
        <CardHeader className="border-b border-white/[0.06] py-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-purple-400" />
            Correctif vs Préventif
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 h-[300px] flex items-center justify-center">
          {loading ? (
            <div className="text-muted-foreground">Chargement...</div>
          ) : stats?.repartitionCorrectivePreventive.corrective === 0 &&
            stats?.repartitionCorrectivePreventive.preventive === 0 ? (
            <div className="text-muted-foreground">Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={repartitionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {repartitionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl shadow-lg shadow-black/20 overflow-hidden">
        <CardHeader className="border-b border-white/[0.06] py-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Pannes par Ligne de Production
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 h-[300px] flex items-center justify-center">
          {loading ? (
            <div className="text-muted-foreground">Chargement...</div>
          ) : barData.length === 0 ? (
            <div className="text-muted-foreground">Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#a1a1aa"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#a1a1aa"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: '#27272a', opacity: 0.4 }}
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="pannes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
