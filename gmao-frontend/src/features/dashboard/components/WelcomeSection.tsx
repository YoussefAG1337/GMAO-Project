'use client';

import { useState, useEffect } from 'react';
import { Shield, Clock, Sparkles } from 'lucide-react';
import { User } from '@/types';

export const roleLabels: Record<string, { label: string; color: string }> = {
  ADMIN: { label: 'Administrateur', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  CHEF_MAINTENANCE: {
    label: 'Chef de Maintenance',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  TECHNICIEN: { label: 'Technicien', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  MAGASINIER: { label: 'Magasinier', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
};

interface WelcomeSectionProps {
  user: User;
}

export function WelcomeSection({ user }: WelcomeSectionProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const roleBadge = roleLabels[user.role] || {
    label: user.role,
    color: 'bg-gray-500/10 text-gray-400',
  };

  return (
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
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadge.color}`}
              >
                <Shield className="w-3 h-3" />
                {roleBadge.label}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/80 bg-white/[0.02] border border-white/[0.04] px-2.5 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                Dernière connexion :{' '}
                {isMounted && user.dernierLogin
                  ? new Date(user.dernierLogin).toLocaleString('fr-FR')
                  : '...'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
