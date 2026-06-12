'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  User,
  Mail,
  Shield,
  Clock,
  CalendarDays,
  Wrench,
  AlertTriangle,
  Cpu,
  TrendingUp,
  Activity,
  ArrowRight,
  Gauge,
  Sparkles,
} from 'lucide-react';

const roleLabels: Record<string, { label: string; color: string }> = {
  ADMIN: { label: 'Administrateur', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  CHEF_MAINTENANCE: { label: 'Chef de Maintenance', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  TECHNICIEN: { label: 'Technicien', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  MAGASINIER: { label: 'Magasinier', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
};

// Mock statistical data for indicators
const kpis = [
  {
    title: 'Interventions en cours',
    value: '8',
    description: '3 en priorité critique',
    icon: Wrench,
    glow: 'hover:border-amber-500/30 hover:shadow-amber-500/10',
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    title: 'Alertes Pièces Critiques',
    value: '3',
    description: 'Seuil minimum atteint',
    icon: AlertTriangle,
    glow: 'hover:border-rose-500/30 hover:shadow-rose-500/10',
    iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  {
    title: 'MTBF Moyen Usine',
    value: '142 h',
    description: '+12% ce mois-ci',
    icon: Clock,
    glow: 'hover:border-[#651FAA]/30 hover:shadow-[#651FAA]/10',
    iconBg: 'bg-[#651FAA]/10 text-purple-300 border-[#651FAA]/20',
  },
  {
    title: 'TRS Global Équipements',
    value: '94.2 %',
    description: 'Objectif usine : 95.0%',
    icon: Cpu,
    glow: 'hover:border-emerald-500/30 hover:shadow-emerald-500/10',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#07080d] text-foreground flex">
        {/* Shimmer skeleton for Sidebar */}
        <div className="hidden lg:flex flex-col w-64 border-r border-white/[0.06] bg-zinc-950/60 p-4 space-y-6">
          <div className="h-8 w-32 bg-white/5 rounded animate-pulse" />
          <div className="space-y-4 pt-6">
            <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
            <div className="h-10 w-full bg-white/5 rounded-xl animate-pulse" />
            <div className="h-10 w-full bg-white/5 rounded-xl animate-pulse" />
            <div className="h-10 w-full bg-white/5 rounded-xl animate-pulse" />
          </div>
        </div>
        
        {/* Shimmer skeleton for Content */}
        <div className="flex-1 flex flex-col">
          <div className="h-16 border-b border-white/[0.06] bg-zinc-950/40 px-6 flex items-center justify-between">
            <div className="h-5 w-40 bg-white/5 rounded animate-pulse" />
            <div className="h-8 w-32 bg-white/5 rounded-xl animate-pulse" />
          </div>
          
          <div className="p-6 md:p-8 space-y-8 max-w-[1600px] w-full mx-auto">
            <div className="h-32 w-full bg-white/5 rounded-2xl animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
              <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
              <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
              <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-64 bg-white/5 rounded-2xl animate-pulse" />
              <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const roleBadge = roleLabels[user.role] || { label: user.role, color: 'bg-gray-500/10 text-gray-400' };

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
                    Dernière connexion : {isMounted && user.dernierLogin ? new Date(user.dernierLogin).toLocaleString('fr-FR') : (user.dernierLogin ? '...' : 'Première connexion')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Grid Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60 px-1">
            Indicateurs de Performance Clés
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <Card
                  key={idx}
                  className={`relative overflow-hidden border-white/[0.06] bg-zinc-950/45 backdrop-blur-xl transition-all duration-300 ${kpi.glow} shadow-lg shadow-black/30 group`}
                >
                  {/* Glowing hover light */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                  
                  <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground/80 tracking-wide uppercase">
                        {kpi.title}
                      </span>
                      <div className={`p-2 rounded-xl border ${kpi.iconBg} transform group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-extrabold tracking-tight text-white mb-1">
                        {kpi.value}
                      </div>
                      <p className="text-xs text-muted-foreground/70 font-medium">
                        {kpi.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

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
                <span className="text-xs font-semibold text-white">
                  {roleBadge.label}
                </span>
              </div>
              <div className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Créé le</span>
                </div>
                <span className="text-xs font-semibold text-white">
                  {isMounted ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : '...'}
                </span>
              </div>
              <div className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Statut</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Actif
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tasks / Assigned Interventions Placeholder */}
          <Card className="border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl shadow-lg shadow-black/20 lg:col-span-2 flex flex-col justify-between">
            <div>
              <CardHeader className="border-b border-white/[0.06] py-4">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    Interventions récentes & Activités
                  </div>
                  <span className="text-xs bg-[#651FAA]/10 text-purple-300 border border-[#651FAA]/20 px-2 py-0.5 rounded-full">
                    {"Aujourd'hui"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Item 1 */}
                <div className="flex items-start justify-between p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.03] hover:border-white/[0.06] transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0 mt-0.5">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Panne Moteur Convoyeur Principal</h4>
                      <p className="text-[10px] text-muted-foreground/80 mt-1">Équipement: CV-010 • Rapporté par: Chef Maintenance</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    En cours
                  </span>
                </div>

                {/* Item 2 */}
                <div className="flex items-start justify-between p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.03] hover:border-white/[0.06] transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Surchauffe Pompe Hydraulique</h4>
                      <p className="text-[10px] text-muted-foreground/80 mt-1">Équipement: PH-220 • Rapporté par: Technicien A</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                    Urgent
                  </span>
                </div>

                {/* Item 3 */}
                <div className="flex items-start justify-between p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.03] hover:border-white/[0.06] transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Entretien Préventif Mensuel Compresseur</h4>
                      <p className="text-[10px] text-muted-foreground/80 mt-1">Équipement: CP-102 • Planifié pour: Demain</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Planifié
                  </span>
                </div>
              </CardContent>
            </div>
            
            <div className="p-6 pt-0 border-t border-white/[0.03]">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300 hover:bg-white/[0.03] py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Voir toutes les interventions
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
    </div>
  );
}
