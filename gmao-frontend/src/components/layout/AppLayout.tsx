'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gmao_sidebar_collapsed');
      return stored === 'true';
    }
    return false;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSetSidebarCollapsed = (value: boolean | ((prev: boolean) => boolean)) => {
    setIsSidebarCollapsed((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      localStorage.setItem('gmao_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="relative min-h-screen bg-[#07080d] text-foreground">
      {/* Premium radial background glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.38_0.23_302/0.04),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,oklch(0.38_0.23_302/0.03),transparent_50%)] pointer-events-none" />

      {/* Mobile Sidebar Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-25 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Wrapper */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-30 transition-transform duration-300 lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={handleSetSidebarCollapsed} />
      </div>

      {/* Main Content Layout */}
      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300',
          isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64',
        )}
      >
        <Header
          onMenuClick={() => setIsMobileOpen(!isMobileOpen)}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={handleSetSidebarCollapsed}
        />

        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto animate-fade-in-up">
          {children}
        </main>
      </div>
    </div>
  );
}
