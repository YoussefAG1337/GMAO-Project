'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Menu, ChevronRight, LogOut, Shield } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}

const pathMap: Record<string, string> = {
  dashboard: 'Tableau de bord',
  interventions: 'Interventions',
  preventif: 'Plans préventifs',
  calendrier: 'Calendrier',
  stock: 'Pièces de rechange',
  mouvements: 'Mouvements stock',
  alertes: 'Alertes',
  pannes: 'Analyse pannes',
  pareto: 'Diagramme Pareto',
  kpis: 'KPIs',
  equipements: 'Équipements',
  utilisateurs: 'Utilisateurs',
  settings: 'Paramètres',
};

const roleLabels: Record<string, { label: string; style: string }> = {
  ADMIN: { label: 'Administrateur', style: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  CHEF_MAINTENANCE: {
    label: 'Chef de Maintenance',
    style: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  TECHNICIEN: { label: 'Technicien', style: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  MAGASINIER: { label: 'Magasinier', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
};

export default function Header({
  onMenuClick,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
}: HeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const roleInfo = roleLabels[user.role] || {
    label: user.role,
    style: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  };

  // Build breadcrumbs
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, idx) => {
    const href = '/' + pathSegments.slice(0, idx + 1).join('/');
    const label = pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    return { label, href };
  });

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-white/[0.06] bg-zinc-950/40 backdrop-blur-md px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.05] lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Toggle when collapsed */}
        {isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="hidden lg:flex p-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:text-foreground hover:bg-white/[0.05] cursor-pointer"
            title="Développer le menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-1.5 text-xs md:text-sm font-medium text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors shrink-0">
            Accueil
          </Link>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <div key={idx} className="flex items-center space-x-1.5 min-w-0">
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/45 shrink-0" />
                {isLast ? (
                  <span className="truncate max-w-[120px] md:max-w-[200px] inline-block align-bottom text-foreground font-semibold">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="truncate max-w-[120px] md:max-w-[200px] inline-block align-bottom hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* System Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-wide">Système opérationnel</span>
        </div>

        {/* User Role Badge */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
            roleInfo.style,
          )}
        >
          <Shield className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{roleInfo.label}</span>
          <span className="md:hidden">
            {user.prenom[0]}
            {user.nom[0]}
          </span>
        </div>

        {/* Simple sign-out */}
        <button
          onClick={logout}
          className="p-2 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
          title="Déconnexion"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
