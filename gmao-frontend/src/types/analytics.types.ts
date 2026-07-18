export interface DashboardStats {
  incidentsOuverts: number;
  otEnCours: number;
  otEnAttenteValidation: number;
}

export interface DashboardKpis {
  disponibilite: number;
  mttr: number;
  mtbf: number;
  dureeTotalePannes: number;
  nombreOT: number;
}

export interface AnalyticsData {
  totalDI: number;
  conversionRate: string;
  di: {
    enCours: number;
    cloture: number;
  };
  ot: {
    enCours: number;
    cloture: number;
  };
  timePerLigne: Array<{ ligne: string; averageTimeMinutes: number }>;
  timePerPanne: Array<{ panne: string; averageTimeMinutes: number }>;
}

export interface TechnicianWorkrateEntry {
  id: number;
  nom: string;
  prenom: string;
  /** Total intervention minutes for the selected day */
  daily: number;
  /** Total intervention minutes for the Monday–Sunday week of the selected day */
  weekly: number;
  /** Total intervention minutes for the full calendar month of the selected day */
  monthly: number;
}

export interface WorkrateData {
  anchorDate: string;
  windows: {
    day: { start: string; end: string };
    week: { start: string; end: string };
    month: { start: string; end: string };
  };
  technicians: TechnicianWorkrateEntry[];
}
