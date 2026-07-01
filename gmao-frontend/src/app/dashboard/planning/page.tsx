import { apiServer } from '@/lib/api-server';
import { PlanningClient } from '@/features/planning/components/PlanningClient';

export default async function PlanningPage() {
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const calendarData = await apiServer
    .get<any>(`/calendar?month=${month}&year=${year}`)
    .then((res) => res.data)
    .catch(() => ({ ots: [], upcomingPlans: [] }));

  return (
    <PlanningClient initialCalendarData={calendarData} initialMonth={month} initialYear={year} />
  );
}
