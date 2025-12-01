import React, { useState, useMemo } from 'react';
import { INITIAL_DATA } from './constants';
import { DispatcherStats, FilterState, SortDirection, SortField } from './types';
import DataTable from './components/DataTable';
import FilterBar from './components/FilterBar';
import ComparisonCharts from './components/ComparisonCharts';
import IndividualAnalysis from './components/IndividualAnalysis';
import { LayoutDashboard, BarChart2 } from 'lucide-react';

// 辅助函数：获取本地时间的 ISO 字符串格式 (yyyy-MM-ddThh:mm)，用于 input[type="datetime-local"]
const getLocalISOString = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
  return localISOTime;
};

const App: React.FC = () => {
  // --- State ---
  const [data] = useState<DispatcherStats[]>(INITIAL_DATA);
  
  // 初始化时间范围：过去7天到当前时间
  const defaultEndDate = new Date();
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultEndDate.getDate() - 7);
  defaultStartDate.setHours(8, 0, 0, 0); // 默认从早上8点开始

  const [filters, setFilters] = useState<FilterState>({
    startDate: getLocalISOString(defaultStartDate),
    endDate: getLocalISOString(defaultEndDate),
    projectCategory: '全部',
    searchQuery: '',
  });
  
  const [sortField, setSortField] = useState<SortField>('successRate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // --- Logic ---

  // 1. Filter Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Filter by Project
      if (filters.projectCategory !== '全部' && item.projectCategory !== filters.projectCategory) {
        return false;
      }
      // Filter by Search
      if (filters.searchQuery && !item.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by Date Time
      if (filters.startDate && filters.endDate) {
          const itemDate = new Date(item.date);
          const start = new Date(filters.startDate);
          const end = new Date(filters.endDate);
          
          if (itemDate < start || itemDate > end) {
              return false;
          }
      }
      return true;
    });
  }, [data, filters]);

  // 2. Sort Data
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortDirection]);

  // 3. Selection Data for Charts
  const selectedData = useMemo(() => {
    return data.filter(item => selectedIds.has(item.id));
  }, [data, selectedIds]);

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
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleToggleAll = () => {
    if (selectedIds.size === sortedData.length && sortedData.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedData.map(d => d.id)));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
                <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">派单员数据分析</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500 hidden sm:block">
               管理员视图
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300">
                <span className="text-xs font-semibold text-slate-600">JD</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro / Instructions */}
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">团队绩效</h2>
            <p className="text-slate-500">
                分析派单员效率、营收贡献及项目分布。支持精确到小时分钟的时间段筛选。
            </p>
        </div>

        {/* Filters */}
        <FilterBar filters={filters} setFilters={setFilters} />

        {/* Dynamic Analysis Section */}
        {selectedIds.size === 1 && (
            <IndividualAnalysis 
                user={selectedData[0]} 
                onClose={() => setSelectedIds(new Set())}
            />
        )}

        {selectedIds.size > 1 && (
          <div className="mb-8 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-800">对比分析</h3>
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
            <ComparisonCharts selectedData={selectedData} />
          </div>
        )}

        {/* Data Table */}
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