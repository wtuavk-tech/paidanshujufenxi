import React, { useState, useMemo } from 'react';
import { INITIAL_DATA, INITIAL_TARGETS } from './constants';
import { DispatcherStats, FilterState, SortDirection, SortField, UserTarget } from './types';
import DataTable from './components/DataTable';
import FilterBar from './components/FilterBar';
import ComparisonCharts from './components/ComparisonCharts';
import IndividualAnalysis from './components/IndividualAnalysis';
import PerformanceAlerts from './components/PerformanceAlerts';
import SettingsModal from './components/SettingsModal';
import { LayoutDashboard, BarChart2, Settings, Users } from 'lucide-react';

const getLocalISOString = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
  return localISOTime;
};

const App: React.FC = () => {
  // --- State ---
  const [data] = useState<DispatcherStats[]>(INITIAL_DATA);
  const [targets, setTargets] = useState<UserTarget[]>(INITIAL_TARGETS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const defaultEndDate = new Date();
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultEndDate.getDate() - 7);
  defaultStartDate.setHours(8, 0, 0, 0);

  const [filters, setFilters] = useState<FilterState>({
    startDate: getLocalISOString(defaultStartDate),
    endDate: getLocalISOString(defaultEndDate),
    projectCategory: '全部',
    searchQuery: '',
    selectedGroups: [], // Default: all groups
  });
  
  const [sortField, setSortField] = useState<SortField>('successRate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // --- Logic ---

  // 1. Filter Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.projectCategory !== '全部' && item.projectCategory !== filters.projectCategory) return false;
      if (filters.searchQuery && !item.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
      // Filter by Groups
      if (filters.selectedGroups.length > 0 && !filters.selectedGroups.includes(item.group)) return false;
      
      if (filters.startDate && filters.endDate) {
          const itemDate = new Date(item.date);
          const start = new Date(filters.startDate);
          const end = new Date(filters.endDate);
          if (itemDate < start || itemDate > end) return false;
      }
      return true;
    });
  }, [data, filters]);

  // 2. Sort Data (for Table)
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortDirection]);

  // 3. Prepare Data for Charts (Individual vs Group Aggregation)
  const chartData = useMemo(() => {
    // A. Specific Individuals Selected -> Show them
    if (selectedIds.size > 0) {
        return data.filter(item => selectedIds.has(item.id));
    }
    
    // B. Multiple Groups Selected (and no individuals) -> Show Group Averages
    if (filters.selectedGroups.length > 1) {
        // Aggregate by group
        const groupStats = new Map<string, DispatcherStats>();
        
        // We only aggregate the *filtered* data to respect date/category filters
        filteredData.forEach(item => {
            if (!groupStats.has(item.group)) {
                // Initialize aggregate object
                groupStats.set(item.group, {
                    id: `group-${item.group}`,
                    name: item.group, // Use group name as display name
                    group: item.group,
                    successRate: 0,
                    dispatchRate: 0,
                    dispatch30MinRate: 0,
                    avgRevenue: 0,
                    totalOrders: 0,
                    projectCategory: '聚合',
                    date: '',
                });
            }
            const g = groupStats.get(item.group)!;
            g.successRate += item.successRate;
            g.dispatchRate += item.dispatchRate;
            g.dispatch30MinRate += item.dispatch30MinRate;
            g.avgRevenue += item.avgRevenue;
            g.totalOrders += item.totalOrders;
            // Using 'date' property to store count for averaging momentarily
            g.date = (Number(g.date || 0) + 1).toString(); 
        });

        // Compute averages
        return Array.from(groupStats.values()).map(g => {
            const count = Number(g.date);
            return {
                ...g,
                successRate: Math.round(g.successRate / count),
                dispatchRate: Math.round(g.dispatchRate / count),
                dispatch30MinRate: Math.round(g.dispatch30MinRate / count),
                avgRevenue: Math.round(g.avgRevenue / count),
                totalOrders: Math.round(g.totalOrders / count), 
                date: new Date().toISOString()
            };
        });
    }

    return []; 
  }, [data, selectedIds, filteredData, filters.selectedGroups]);

  // --- Handlers ---
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleToggleAll = () => {
    if (selectedIds.size === sortedData.length && sortedData.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(sortedData.map(d => d.id)));
  };

  const handleReset = () => {
    setFilters({
        startDate: getLocalISOString(defaultStartDate),
        endDate: getLocalISOString(defaultEndDate),
        projectCategory: '全部',
        searchQuery: '',
        selectedGroups: [],
    });
    setSelectedIds(new Set());
    // Optional: Reset sort too? setSortField('successRate'); setSortDirection('desc');
  };

  // Determine what analysis view to show
  const showIndividualAnalysis = selectedIds.size === 1;
  const showGroupComparison = selectedIds.size === 0 && filters.selectedGroups.length > 1;
  const showMultiUserComparison = selectedIds.size > 1;

  // Selected User Data for Individual Analysis
  const selectedUserData = useMemo(() => {
      return data.find(item => selectedIds.has(item.id));
  }, [data, selectedIds]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        targets={targets}
        onSave={setTargets}
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
                <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">派单员数据分析</h1>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                title="管理考核标准"
             >
                <Settings className="h-5 w-5" />
             </button>
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300 ml-2">
                <span className="text-xs font-semibold text-slate-600">JD</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">团队绩效</h2>
            <p className="text-slate-500">
                {filters.selectedGroups.length > 0 ? `当前正在查看 ${filters.selectedGroups.join(', ')} 的数据` : '分析派单员效率、营收贡献及项目分布。'}
            </p>
        </div>

        {/* 1. Risk Alerts Section */}
        <PerformanceAlerts data={filteredData} targets={targets} />

        {/* 2. Filters */}
        <FilterBar filters={filters} setFilters={setFilters} onReset={handleReset} />

        {/* 3. Analysis Views */}
        
        {/* Case A: Single User Deep Dive */}
        {showIndividualAnalysis && selectedUserData && (
            <IndividualAnalysis 
                user={selectedUserData} 
                onClose={() => setSelectedIds(new Set())}
            />
        )}

        {/* Case B: Multi-User Comparison (Specific selections override group view) */}
        {showMultiUserComparison && (
          <div className="mb-8 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-800">人员对比分析</h3>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        已选 {selectedIds.size} 人
                    </span>
                </div>
                <button 
                    onClick={() => setSelectedIds(new Set())}
                    className="text-sm text-slate-500 hover:text-red-500 underline transition-colors"
                >
                    清空选择
                </button>
            </div>
            <ComparisonCharts selectedData={chartData} />
          </div>
        )}

        {/* Case C: Group Comparison (Only when multiple groups selected AND no users selected) */}
        {showGroupComparison && chartData.length > 0 && (
          <div className="mb-8 animate-in slide-in-from-top-4 duration-300 border-2 border-dashed border-blue-100 bg-blue-50/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-800">组别综合对比</h3>
                <span className="text-sm text-slate-500 font-normal">（显示组内人员的平均数据）</span>
            </div>
            <ComparisonCharts selectedData={chartData} />
          </div>
        )}

        {/* 4. Data Table */}
        <DataTable 
          data={sortedData}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleAll={handleToggleAll}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />

      </main>
    </div>
  );
};

export default App;