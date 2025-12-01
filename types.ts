export interface DispatcherStats {
  id: string;
  name: string;
  group: string; // 新增：所属组别
  successRate: number; // Percentage 0-100
  dispatchRate: number; // Percentage 0-100
  avgRevenue: number; // Currency
  dispatch30MinRate: number; // Percentage 0-100
  totalOrders: number; // Count
  projectCategory: string; // e.g., 'Home Repair', 'Installation', 'Maintenance'
  date: string; // ISO Date string
}

export type SortField = keyof Omit<DispatcherStats, 'id' | 'projectCategory' | 'date' | 'group'>;
export type SortDirection = 'asc' | 'desc';

export interface FilterState {
  startDate: string;
  endDate: string;
  projectCategory: string;
  searchQuery: string;
  selectedGroups: string[]; // 新增：选中的组别
}

// 新增：个人考核标准接口
export interface UserTarget {
  id: string;
  name: string;
  targetSuccessRate: number;
  targetDispatchRate: number;
  targetDispatch30Rate: number;
}