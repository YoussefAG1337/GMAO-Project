'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { startOfMonth, eachDayOfInterval, addMonths, subMonths, getDay, isSameDay } from 'date-fns';

import { PlanningHeader } from '@/features/planning/components/PlanningHeader';
import { PlanningLegend } from '@/features/planning/components/PlanningLegend';
import { PlanningCalendarGrid } from '@/features/planning/components/PlanningCalendarGrid';
import { PlanningDayModal } from '@/features/planning/components/PlanningDayModal';

const fetcher = (url: string) => api.get<any>(url).then((res) => res.data);

interface PlanningClientProps {
  initialCalendarData: any;
  initialMonth: number;
  initialYear: number;
}

export function PlanningClient({
  initialCalendarData,
  initialMonth,
  initialYear,
}: PlanningClientProps) {
  const { user } = useAuth();
  const isAdminOrChef = user?.role === 'ADMIN' || user?.role === 'CHEF_MAINTENANCE';

  // We initialize the client state with the same month/year the server used
  // to avoid hydration mismatch if the server is in a different timezone than the client.
  // Although new Date() on client might differ if they cross midnight on month boundary.
  const [currentDate, setCurrentDate] = useState(new Date(initialYear, initialMonth - 1, 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  // Only use initialData if the month/year match the server's initial fetch
  const isInitialFetch = month === initialMonth && year === initialYear;

  const { data: calendarData, mutate } = useSWR(`/calendar?month=${month}&year=${year}`, fetcher, {
    fallbackData: isInitialFetch ? initialCalendarData : undefined,
  });

  const ots = calendarData?.ots || [];
  const upcomingPlans = calendarData?.upcomingPlans || [];

  // Generate calendar grid days (42 cells: 6 rows x 7 cols)
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate);

    // getDay returns 0 for Sunday, 1 for Monday. We want Monday=0, Sunday=6
    const startDay = (getDay(start) + 6) % 7;

    // We need 42 days total (6 weeks * 7 days)
    const startDate = new Date(start);
    startDate.setDate(startDate.getDate() - startDay);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  const handlePrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleGenerateNow = async (planId: number) => {
    if (!window.confirm('Générer un OT maintenant pour ce plan ?')) return;
    try {
      const response = await api.post<any>(`/plans/${planId}/trigger`);
      toast.success(`OT préventif généré : ${response.data.numeroOT}`);
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la génération');
    }
  };

  const selectedDayOTs = selectedDate
    ? ots.filter((ot: any) => isSameDay(new Date(ot.datePrevue), selectedDate))
    : [];

  const selectedDayPlans = selectedDate
    ? upcomingPlans.filter((p: any) => isSameDay(new Date(p.prochaineExecution), selectedDate))
    : [];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <PlanningHeader
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />

      <PlanningLegend />

      <PlanningCalendarGrid
        daysInMonth={daysInMonth}
        currentDate={currentDate}
        ots={ots}
        upcomingPlans={upcomingPlans}
        onSelectDate={setSelectedDate}
      />

      <PlanningDayModal
        selectedDate={selectedDate}
        onClose={() => setSelectedDate(null)}
        selectedDayOTs={selectedDayOTs}
        selectedDayPlans={selectedDayPlans}
        isAdminOrChef={isAdminOrChef}
        onGenerateNow={handleGenerateNow}
      />
    </div>
  );
}
