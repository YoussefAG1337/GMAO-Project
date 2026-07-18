import { Ot } from './ot.types';
import { Plan } from './plan.types';

export interface CalendarResponse {
  ots: Ot[];
  upcomingPlans: Plan[];
}
