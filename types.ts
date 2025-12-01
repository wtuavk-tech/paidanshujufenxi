export interface DispatcherStats {
  id: string;
  name: string;
  successRate: number; // Percentage 0-100
  dispatchRate: number; // Percentage 0-100
  avgRevenue: number; // Currency
  dispatch30MinRate: number; // Percentage 0-100
  totalOrders: number; // Count
  projectCategory: string; // e.g., 'Home Repair', 'Installation', 'Maintenance'
  date: string; // ISO Date string
}

export type SortField = keyof Omit<DispatcherStats, 'id' | 'projectCategory' | 'date'>;
export type SortDirection = 'asc' | 'desc';

export interface FilterState {
  startDate: string;
  endDate: string;
  projectCategory: string;
  searchQuery: string;
}
