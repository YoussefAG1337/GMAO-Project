'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Wrench,
  CalendarRange,
  Calendar,
  Package,
  ArrowUpDown,
  AlertTriangle,
  Activity,
  BarChart3,
  Gauge,
  Cpu,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Factory,
  MessageSquareWarning,
  FileText,
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: {
    text: string;
    type: string;
  };
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const sections: SidebarSection[] = [
    {
      title: 'Principal',
      items: [
        {
          name: 'Tableau de bord',
          href: '/dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Maintenance',
      items: [
        {
          name: 'Demandes (DI)',
          href: '/dashboard/dis',
          icon: MessageSquareWarning,
        },
        {
          name: 'Ordres (OT)',
          href: '/dashboard/ots',
          icon: Wrench,
        },
        {
          name: 'Rapports (RI)',
          href: '/dashboard/rapports',
          icon: FileText,
        },
        {
          name: 'Plans préventifs',
          href: '/dashboard/plans',
          icon: CalendarRange,
        },
        {
          name: 'Calendrier',
          href: '/dashboard/planning',
          icon: Calendar,
        },
      ],
    },
    {
      title: 'Logistique',
      items: [
        {
          name: 'Pièces de rechange',
          href: '/dashboard/stock',
          icon: Package,
        },
        {
          name: 'Mouvements stock',
          href: '/dashboard/stock/mouvements',
          icon: ArrowUpDown,
        },
        {
          name: 'Alertes',
          href: '/dashboard/stock/alertes',
          icon: AlertTriangle,
          badge: { text: '3', type: 'danger' },
        },
      ],
    },
    {
      title: 'Analyse',
      items: [
        {
          name: 'Analyse pannes',
          href: '/dashboard/pannes',
          icon: Activity,
        },
        {
          name: 'Diagramme Pareto',
          href: '/dashboard/pareto',
          icon: BarChart3,
        },
        {
          name: 'KPIs',
          href: '/dashboard/kpis',
          icon: Gauge,
        },
      ],
    },
  ];

  // Admin section
  const adminSection: SidebarSection = {
    title: 'Référentiel',
    items: [
      {
        name: 'Équipements',
        href: '/dashboard/equipements',
        icon: Cpu,
      },
      {
        name: 'Utilisateurs',
        href: '/dashboard/utilisateurs',
        icon: Users,
      },
    ],
  };

  const allSections: SidebarSection[] =
    user.role === 'ADMIN' ? [...sections, adminSection] : sections;

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col border-r border-white/[0.06] bg-zinc-950/60 backdrop-blur-xl transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#651FAA] flex items-center justify-center shadow-md shadow-[#651FAA]/20 border border-[#651FAA]/30">
            <Factory className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-extrabold text-md bg-gradient-to-r from-purple-200 to-violet-200 bg-clip-text text-transparent tracking-tight whitespace-nowrap">
              GMAO Pro
            </span>
          )}
        </div>

        {/* Collapse Button */}
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sidebar Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {allSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item, itemIdx) => {
                const isActive =
                  item.href === '/dashboard' || item.href === '/dashboard/stock'
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <li key={itemIdx}>
                    <Link
                      href={item.href}
                      className={cn(
                        'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:-translate-y-0.5',
                        isActive
                          ? 'bg-[#651FAA]/10 text-purple-300 border border-[#651FAA]/20 shadow-[0_0_15px_rgba(101,31,170,0.1)]'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03] border border-transparent',
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5 shrink-0',
                          isActive
                            ? 'text-purple-400'
                            : 'text-muted-foreground group-hover:text-foreground transition-colors',
                        )}
                      />
                      {!isCollapsed && <span className="flex-1 truncate">{item.name}</span>}
                      {!isCollapsed && item.badge && (
                        <span
                          className={cn(
                            'inline-flex h-5 items-center justify-center rounded-full px-2 text-[10px] font-bold border',
                            item.badge.type === 'danger'
                              ? 'bg-red-500/10 text-red-400 border-red-500/25 animate-pulse'
                              : 'bg-[#651FAA]/10 text-purple-300 border-[#651FAA]/20',
                          )}
                        >
                          {item.badge.text}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-white/[0.06] space-y-1">
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full flex items-center justify-center p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all cursor-pointer"
            title="Développer la barre latérale"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        <Link
          href="/dashboard/settings"
          className={cn(
            'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:-translate-y-0.5',
            pathname === '/dashboard/settings'
              ? 'bg-[#651FAA]/10 text-purple-300 border border-[#651FAA]/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03] border border-transparent',
          )}
          title={isCollapsed ? 'Paramètres' : undefined}
        >
          <Settings className="w-5 h-5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
          {!isCollapsed && <span className="flex-1 truncate">Paramètres</span>}
        </Link>
        <button
          onClick={logout}
          className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          title={isCollapsed ? 'Déconnexion' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0 text-red-400 group-hover:text-red-300 transition-colors" />
          {!isCollapsed && <span className="flex-1 text-left truncate">Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}
