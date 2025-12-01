import React from 'react';
import { ArrowUpDown, CheckSquare, Square } from 'lucide-react';
import { DispatcherStats, SortField, SortDirection } from '../types';

interface DataTableProps {
  data: DispatcherStats[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  sortField,
  sortDirection,
  onSort
}) => {

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-slate-300 ml-1 inline-block" />;
    return <ArrowUpDown className={`h-3 w-3 text-blue-500 ml-1 inline-block transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />;
  };

  const HeaderCell = ({ field, label, align = 'left' }: { field?: SortField, label: string, align?: 'left' | 'right' | 'center' }) => (
    <th 
      className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-colors text-${align}`}
      onClick={() => field && onSort(field)}
    >
      <div className={`flex items-center ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}>
        {label}
        {field && <SortIcon field={field} />}
      </div>
    </th>
  );

  const formatPercent = (val: number) => `${val}%`;
  const formatCurrency = (val: number) => `¥${val.toLocaleString()}`;

  const allSelected = data.length > 0 && data.every(d => selectedIds.has(d.id));
  const someSelected = data.some(d => selectedIds.has(d.id)) && !allSelected;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-left">
              <th className="px-6 py-4 w-12 text-center">
                <button 
                  onClick={onToggleAll}
                  className="focus:outline-none"
                >
                  {allSelected ? (
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                  ) : someSelected ? (
                    <div className="h-5 w-5 bg-blue-600 rounded flex items-center justify-center text-white">
                        <span className="w-3 h-0.5 bg-white"></span>
                    </div>
                  ) : (
                    <Square className="h-5 w-5 text-slate-300" />
                  )}
                </button>
              </th>
              <HeaderCell label="姓名" field="name" />
              <HeaderCell label="成单率" field="successRate" align="right" />
              <HeaderCell label="派单率" field="dispatchRate" align="right" />
              <HeaderCell label="每单业绩" field="avgRevenue" align="right" />
              <HeaderCell label="30分钟派单率" field="dispatch30MinRate" align="right" />
              <HeaderCell label="总单量" field="totalOrders" align="right" />
              <HeaderCell label="维修项目" align="center" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
                <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                        未找到符合条件的派单员。
                    </td>
                </tr>
            ) : (
                data.map((row) => {
                const isSelected = selectedIds.has(row.id);
                return (
                    <tr 
                    key={row.id} 
                    className={`hover:bg-blue-50/30 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}
                    >
                    <td className="px-6 py-4 text-center">
                        <button 
                        onClick={() => onToggleSelect(row.id)}
                        className="focus:outline-none"
                        >
                        {isSelected ? (
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                            <Square className="h-5 w-5 text-slate-300 hover:text-slate-400" />
                        )}
                        </button>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3">
                            {row.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-700">{row.name}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">{formatPercent(row.successRate)}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">{formatPercent(row.dispatchRate)}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">{formatCurrency(row.avgRevenue)}</td>
                    <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        row.dispatch30MinRate >= 80 ? 'bg-green-100 text-green-800' : 
                        row.dispatch30MinRate >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                        }`}>
                        {formatPercent(row.dispatch30MinRate)}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-700">{row.totalOrders}</td>
                    <td className="px-6 py-4 text-center">
                        <span className="inline-block px-2 py-1 text-xs text-slate-500 bg-slate-100 rounded-md">
                        {row.projectCategory}
                        </span>
                    </td>
                    </tr>
                );
                })
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center">
        <span className="text-xs text-slate-500">显示 {data.length} 条记录</span>
        <div className="text-xs text-slate-500">
             已选择 {selectedIds.size} 项
        </div>
      </div>
    </div>
  );
};

export default DataTable;