'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import useSWR from 'swr';
import { api } from '@/lib/api';
import {
  User,
  Mail,
  Shield,
  Clock,
  CalendarDays,
  Wrench,
  AlertTriangle,
  Cpu,
  Activity,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const roleLabels: Record<string, { label: string; color: string }> = {
  ADMIN: { label: 'Administrateur', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  CHEF_MAINTENANCE: {
    label: 'Chef de Maintenance',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  TECHNICIEN: { label: 'Technicien', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  MAGASINIER: { label: 'Magasinier', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
};

const fetcher = (url: string) => api.get<any>(url).then((res) => res.data);

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  const { data: stats, isLoading: statsLoading } = useSWR('/dashboard/stats', fetcher);
  const { data: kpis, isLoading: kpisLoading } = useSWR(user?.role === 'ADMIN' || user?.role === 'CHEF_MAINTENANCE' ? '/dashboard/kpis' : null, fetcher);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#07080d] text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) return null;

  const roleBadge = roleLabels[user.role] || {
    label: user.role,
    color: 'bg-gray-500/10 text-gray-400',
  };

  const repartitionData = stats ? [
    { name: 'Corrective', value: stats.repartitionCorrectivePreventive.corrective, color: '#f43f5e' },
    { name: 'Préventive', value: stats.repartitionCorrectivePreventive.preventive, color: '#10b981' }
  ] : [];

  const barData = stats ? stats.pannesParLigne.map((p: any) => ({
    name: p.ligneNom,
    pannes: p.count
  })) : [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative group overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-[#651FAA]/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#651FAA] to-purple-500 blur-sm opacity-30 group-hover:opacity-60 transition duration-500" />
              <div className="relative w-16 h-16 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-xl font-bold text-white uppercase shadow-inner">
                {user.prenom[0]}
                {user.nom[0]}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent tracking-tight">
                  Bonjour, {user.prenom} {user.nom}
                </h2>
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse-glow hidden sm:inline" />
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadge.color}`}>
                  <Shield className="w-3 h-3" />
                  {roleBadge.label}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/80 bg-white/[0.02] border border-white/[0.04] px-2.5 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" />
                  Dernière connexion : {isMounted && user.dernierLogin ? new Date(user.dernierLogin).toLocaleString('fr-FR') : '...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid Section - Hidden for Technicians, who get a personalized view */}
      {user.role !== 'TECHNICIEN' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60 px-1">
            Indicateurs Clés {statsLoading ? '(Chargement...)' : ''}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden border-white/[0.06] bg-zinc-950/45 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/30 hover:shadow-amber-500/10 shadow-lg shadow-black/30 group">
              <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground/80 tracking-wide uppercase">Incidents Ouverts (DI)</span>
                  <div className="p-2 rounded-xl border bg-amber-500/10 text-amber-400 border-amber-500/20 transform group-hover:scale-110 transition-transform duration-300">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold tracking-tight text-white mb-1">{stats?.incidentsOuverts || 0}</div>
                  <p className="text-xs text-muted-foreground/70 font-medium">Demandes en attente</p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-white/[0.06] bg-zinc-950/45 backdrop-blur-xl transition-all duration-300 hover:border-[#651FAA]/30 hover:shadow-[#651FAA]/10 shadow-lg shadow-black/30 group">
              <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground/80 tracking-wide uppercase">OTs En Cours</span>
                  <div className="p-2 rounded-xl border bg-[#651FAA]/10 text-purple-300 border-[#651FAA]/20 transform group-hover:scale-110 transition-transform duration-300">
                    <Wrench className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold tracking-tight text-white mb-1">{stats?.otEnCours || 0}</div>
                  <p className="text-xs text-muted-foreground/70 font-medium">Interventions actives</p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-white/[0.06] bg-zinc-950/45 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/30 hover:shadow-blue-500/10 shadow-lg shadow-black/30 group">
              <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground/80 tracking-wide uppercase">OTs à Valider</span>
                  <div className="p-2 rounded-xl border bg-blue-500/10 text-blue-400 border-blue-500/20 transform group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold tracking-tight text-white mb-1">{stats?.otEnAttenteValidation || 0}</div>
                  <p className="text-xs text-muted-foreground/70 font-medium">En attente de clôture</p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-white/[0.06] bg-zinc-950/45 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/30 hover:shadow-emerald-500/10 shadow-lg shadow-black/30 group">
              <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground/80 tracking-wide uppercase">Disponibilité (TRS)</span>
                  <div className="p-2 rounded-xl border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 transform group-hover:scale-110 transition-transform duration-300">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold tracking-tight text-white mb-1">
                    {kpis ? `${kpis.disponibilite.toFixed(1)}%` : '--'}
                  </div>
                  <p className="text-xs text-muted-foreground/70 font-medium">Disponibilité globale usine</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Technician Dashboard View */}
      {user.role === 'TECHNICIEN' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60 px-1">
            Mes Interventions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="relative overflow-hidden border-amber-500/20 bg-amber-500/5 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/40 shadow-lg group">
              <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-amber-400 tracking-wide uppercase">À Faire Aujourd&apos;hui</span>
                  <div className="p-2 rounded-xl border bg-amber-500/10 text-amber-400 border-amber-500/20">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground/80 font-medium mb-4">Vous avez des ordres de travail en attente dans votre file.</p>
                  <Link 
                    href="/dashboard/ots"
                    className={cn(buttonVariants({ variant: 'default' }), "w-full bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-500/20")}
                  >
                    Voir mes interventions assignées
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-[#651FAA]/20 bg-[#651FAA]/5 backdrop-blur-xl transition-all duration-300 hover:border-[#651FAA]/40 shadow-lg group">
              <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-purple-400 tracking-wide uppercase">Signaler un Incident</span>
                  <div className="p-2 rounded-xl border bg-[#651FAA]/10 text-purple-400 border-[#651FAA]/20">
                    <Wrench className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground/80 font-medium mb-4">Signalez une nouvelle panne détectée sur le terrain.</p>
                  <Link 
                    href="/dashboard/dis"
                    className={cn(buttonVariants({ variant: 'default' }), "w-full bg-[#651FAA] hover:bg-purple-600 text-white font-bold shadow-lg shadow-[#651FAA]/20")}
                  >
                    Créer une Demande (DI)
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {(user.role === 'ADMIN' || user.role === 'CHEF_MAINTENANCE') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl shadow-lg shadow-black/20 overflow-hidden">
            <CardHeader className="border-b border-white/[0.06] py-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-purple-400" />
                Correctif vs Préventif
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 h-[300px] flex items-center justify-center">
              {statsLoading ? (
                <div className="text-muted-foreground">Chargement...</div>
              ) : stats?.repartitionCorrectivePreventive.corrective === 0 && stats?.repartitionCorrectivePreventive.preventive === 0 ? (
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
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
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
              {statsLoading ? (
                <div className="text-muted-foreground">Chargement...</div>
              ) : barData.length === 0 ? (
                <div className="text-muted-foreground">Aucune donnée</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      cursor={{ fill: '#27272a', opacity: 0.4 }}
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="pannes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* General Stats and User Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Account Info */}
        <Card className="border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl shadow-lg shadow-black/20 overflow-hidden lg:col-span-1">
          <CardHeader className="border-b border-white/[0.06] py-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
              <User className="w-4 h-4 text-purple-400" />
              Détails du compte
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 divide-y divide-white/[0.05]">
            <div className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Adresse email</span>
              </div>
              <span className="text-xs font-semibold text-white break-all text-right max-w-[180px]">
                {user.email}
              </span>
            </div>
            <div className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Type de rôle</span>
              </div>
              <span className="text-xs font-semibold text-white">{roleBadge.label}</span>
            </div>
            <div className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Créé le</span>
              </div>
              <span className="text-xs font-semibold text-white">
                {isMounted ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '...'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Detailed KPIs (Admin/Chef) */}
        {(user.role === 'ADMIN' || user.role === 'CHEF_MAINTENANCE') && (
          <Card className="border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl shadow-lg shadow-black/20 lg:col-span-2 flex flex-col justify-between">
            <div>
              <CardHeader className="border-b border-white/[0.06] py-4">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    Performances Techniques (KPIs)
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {kpisLoading ? (
                  <div className="text-center text-muted-foreground py-8">Chargement des indicateurs...</div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                      <p className="text-xs text-muted-foreground mb-1">MTTR (Temps Moyen Réparation)</p>
                      <p className="text-2xl font-bold text-white">{kpis?.mttr ? `${kpis.mttr.toFixed(1)} h` : 'N/A'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                      <p className="text-xs text-muted-foreground mb-1">MTBF (Temps Moyen Entre Pannes)</p>
                      <p className="text-2xl font-bold text-white">{kpis?.mtbf ? `${kpis.mtbf.toFixed(1)} h` : 'N/A'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                      <p className="text-xs text-muted-foreground mb-1">Durée totale pannes</p>
                      <p className="text-2xl font-bold text-rose-400">{kpis?.dureeTotalePannes ? `${kpis.dureeTotalePannes.toFixed(1)} h` : '0 h'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                      <p className="text-xs text-muted-foreground mb-1">Total Interventions</p>
                      <p className="text-2xl font-bold text-blue-400">{kpis?.nombreOT || 0}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
