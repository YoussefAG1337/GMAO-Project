export interface IDashboardService {
  getDashboardStats(): Promise<any>;
  getKPIs(filters: any): Promise<any>;
}
