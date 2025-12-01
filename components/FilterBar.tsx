import React, { useState, useRef, useEffect } from 'react';
import { Filter, Calendar, Briefcase, Search, Users, Check, ChevronDown, RotateCcw } from 'lucide-react';
import { PROJECT_CATEGORIES, GROUPS } from '../constants';
import { FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onReset: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, onReset }) => {
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (groupRef.current && !groupRef.current.contains(event.target as Node)) {
        setIsGroupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleInputChange = (field: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const toggleGroup = (group: string) => {
    setFilters(prev => {
        const newGroups = prev.selectedGroups.includes(group)
            ? prev.selectedGroups.filter(g => g !== group)
            : [...prev.selectedGroups, group];
        return { ...prev, selectedGroups: newGroups };
    });
  };

  return (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col xl:flex-row gap-3 items-center z-20 relative">
      
      {/* Left side: Filters */}
      <div className="flex flex-1 flex-col md:flex-row gap-2 w-full items-center flex-wrap xl:flex-nowrap">
        
        {/* Project Filter */}
        <div className="relative group w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Briefcase className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <select
            value={filters.projectCategory}
            onChange={(e) => handleInputChange('projectCategory', e.target.value)}
            className="w-full md:w-32 pl-8 pr-8 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer hover:bg-slate-100"
          >
            {PROJECT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
             <Filter className="h-3 w-3 text-slate-400" />
          </div>
        </div>

        {/* Group Filter */}
        <div className="relative w-full md:w-auto" ref={groupRef}>
            <button 
                onClick={() => setIsGroupOpen(!isGroupOpen)}
                className="w-full md:w-32 pl-2.5 pr-2 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50 hover:bg-slate-100 flex items-center justify-between"
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-700 truncate">
                        {filters.selectedGroups.length === 0 ? '所有组别' : 
                         filters.selectedGroups.length === 1 ? filters.selectedGroups[0] : 
                         `${filters.selectedGroups.length}个组`}
                    </span>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
            </button>
            
            {isGroupOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 grid grid-cols-1 gap-1 max-h-64 overflow-y-auto">
                    {GROUPS.map(group => {
                        const isSelected = filters.selectedGroups.includes(group);
                        return (
                            <button
                                key={group}
                                onClick={() => toggleGroup(group)}
                                className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                                    isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-slate-50 text-slate-600'
                                }`}
                            >
                                <span>{group}</span>
                                {isSelected && <Check className="h-3 w-3" />}
                            </button>
                        );
                    })}
                    {filters.selectedGroups.length > 0 && (
                        <div className="border-t border-slate-100 mt-1 pt-1">
                            <button 
                                onClick={() => setFilters(prev => ({...prev, selectedGroups: []}))}
                                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 py-1"
                            >
                                清空选择
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Date Filters - Merged into one pill */}
        <div className="flex items-center gap-2 w-full md:w-auto bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5">
            <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <input 
                    type="datetime-local"
                    value={filters.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="bg-transparent text-sm text-slate-600 focus:outline-none w-32 md:w-[135px]"
                />
            </div>
            <span className="text-slate-400 text-xs">至</span>
            <div className="flex items-center gap-2">
                <input 
                    type="datetime-local"
                    value={filters.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="bg-transparent text-sm text-slate-600 focus:outline-none w-32 md:w-[135px]"
                />
            </div>
        </div>

        {/* Reset Button */}
        <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-red-500 hover:border-red-200 transition-colors whitespace-nowrap"
            title="重置"
        >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="text-sm font-medium">重置</span>
        </button>

      </div>

      {/* Right side: Search */}
      <div className="relative w-full xl:w-56 shrink-0 mt-2 xl:mt-0">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
          <Search className="h-3.5 w-3.5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="搜索姓名..."
          value={filters.searchQuery}
          onChange={(e) => handleInputChange('searchQuery', e.target.value)}
          className="w-full pl-8 pr-4 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>
    </div>
  );
};

export default FilterBar;