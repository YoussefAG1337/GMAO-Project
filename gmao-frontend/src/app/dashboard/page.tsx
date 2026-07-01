'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import useSWR from 'swr';
import { api } from '@/lib/api';

import { WelcomeSection } from '@/features/dashboard/components/WelcomeSection';
import { KpiGrid } from '@/features/dashboard/components/KpiGrid';
import { TechnicianView } from '@/features/dashboard/components/TechnicianView';
import { DashboardCharts } from '@/features/dashboard/components/DashboardCharts';
import { UserDetailsGrid } from '@/features/dashboard/components/UserDetailsGrid';

const fetcher = (url: string) => api.get<any>(url).then((res) => res.data);

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  const { data: stats, isLoading: statsLoading } = useSWR('/dashboard/stats', fetcher);
  const { data: kpis, isLoading: kpisLoading } = useSWR(
    user?.role === 'ADMIN' || user?.role === 'CHEF_MAINTENANCE' ? '/dashboard/kpis' : null,
    fetcher,
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (authLoading || !isMounted) {
    return (
      <div className="relative min-h-screen bg-[#07080d] text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <WelcomeSection user={user} />

      {/* KPI Grid Section - Hidden for Technicians */}
      {user.role !== 'TECHNICIEN' && (
        <KpiGrid stats={stats} kpis={kpis} loading={statsLoading || kpisLoading} />
      )}

      {/* Technician Dashboard View */}
      {user.role === 'TECHNICIEN' && <TechnicianView />}

      {/* Charts Section */}
      {(user.role === 'ADMIN' || user.role === 'CHEF_MAINTENANCE') && (
        <DashboardCharts stats={stats} loading={statsLoading} />
      )}

      {/* General Stats and User Info Grid */}
      <UserDetailsGrid user={user} kpis={kpis} loading={kpisLoading} />
    </div>
  );
}
