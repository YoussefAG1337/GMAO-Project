'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User as UserIcon, Mail, Shield, CalendarDays, Activity } from 'lucide-react';
import { User } from '@/types';
import { roleLabels } from './WelcomeSection';

interface UserDetailsGridProps {
  user: User;
  kpis: any;
  loading: boolean;
}

export function UserDetailsGrid({ user, kpis, loading }: UserDetailsGridProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const roleBadge = roleLabels[user.role] || {
    label: user.role,
    color: 'bg-gray-500/10 text-gray-400',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* User Account Info */}
      <Card className="border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl shadow-lg shadow-black/20 overflow-hidden lg:col-span-1">
        <CardHeader className="border-b border-white/[0.06] py-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-purple-400" />
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
              {loading ? (
                <div className="text-center text-muted-foreground py-8">
                  Chargement des indicateurs...
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                    <p className="text-xs text-muted-foreground mb-1">
                      MTTR (Temps Moyen Réparation)
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {kpis?.mttr ? `${kpis.mttr.toFixed(1)} h` : 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                    <p className="text-xs text-muted-foreground mb-1">
                      MTBF (Temps Moyen Entre Pannes)
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {kpis?.mtbf ? `${kpis.mtbf.toFixed(1)} h` : 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                    <p className="text-xs text-muted-foreground mb-1">Durée totale pannes</p>
                    <p className="text-2xl font-bold text-rose-400">
                      {kpis?.dureeTotalePannes ? `${kpis.dureeTotalePannes.toFixed(1)} h` : '0 h'}
                    </p>
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
  );
}
