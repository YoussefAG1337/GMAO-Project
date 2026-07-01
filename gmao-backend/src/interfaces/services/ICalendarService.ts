export interface ICalendarService {
  getCalendarData(month: number, year: number): Promise<{ ots: any[]; upcomingPlans: any[] }>;
}
