import React from 'react';
import { Filter, Calendar, Briefcase, Search } from 'lucide-react';
import { PROJECT_CATEGORIES } from '../constants';
import { FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters }) => {
  
  const handleInputChange = (field: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
      <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
        
        {/* Project Filter */}
        <div className="relative group w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Briefcase className="h-4 w-4 text-slate-400" />
          </div>
          <select
            value={filters.projectCategory}
            onChange={(e) => handleInputChange('projectCategory', e.target.value)}
            className="w-full md:w-auto pl-10 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer hover:bg-slate-100 min-w-[160px]"
          >
            {PROJECT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
             <Filter className="h-3 w-3 text-slate-400" />
          </div>
        </div>

        {/* DateTime Filters */}
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                    type="datetime-local"
                    value={filters.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full md:w-auto pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-600 font-medium"
                />
            </div>
            <span className="text-slate-400 hidden md:block">至</span>
            <span className="text-slate-400 md:hidden self-center">↓</span>
            <div className="relative w-full md:w-auto">
                <input 
                    type="datetime-local"
                    value={filters.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="w-full md:w-auto pl-3 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-600 font-medium"
                />
            </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full lg:w-64">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="搜索姓名..."
          value={filters.searchQuery}
          onChange={(e) => handleInputChange('searchQuery', e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>
    </div>
  );
};

export default FilterBar;