import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { DispatcherStats, UserTarget } from '../types';

interface PerformanceAlertsProps {
  data: DispatcherStats[];
  targets: UserTarget[];
}

const PerformanceAlerts: React.FC<PerformanceAlertsProps> = ({ data, targets }) => {
  // Aggregate data by user to get average performance over the selected period
  const userAggregates = new Map<string, { 
    successSum: number, 
    dispatch30Sum: number, 
    count: number,
    name: string 
  }>();

  data.forEach(item => {
    const current = userAggregates.get(item.name) || { successSum: 0, dispatch30Sum: 0, count: 0, name: item.name };
    current.successSum += item.successRate;
    current.dispatch30Sum += item.dispatch30MinRate;
    current.count += 1;
    userAggregates.set(item.name, current);
  });

  const alertsSuccess: { name: string, value: number, target: number }[] = [];
  const alertsDispatch30: { name: string, value: number, target: number }[] = [];

  userAggregates.forEach((stats, name) => {
    const avgSuccess = Math.round(stats.successSum / stats.count);
    const avgDispatch30 = Math.round(stats.dispatch30Sum / stats.count);

    const target = targets.find(t => t.name === name);
    if (target) {
        if (avgSuccess < target.targetSuccessRate) {
            alertsSuccess.push({ name, value: avgSuccess, target: target.targetSuccessRate });
        }
        if (avgDispatch30 < target.targetDispatch30Rate) {
            alertsDispatch30.push({ name, value: avgDispatch30, target: target.targetDispatch30Rate });
        }
    }
  });

  if (alertsSuccess.length === 0 && alertsDispatch30.length === 0) return null;

  return (
    <div className="mb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Success Rate Alerts */}
      {alertsSuccess.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex flex-col md:flex-row md:items-center gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-red-700 font-bold min-w-[180px]">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm">成单率低于预警值</span>
            <span className="bg-red-200 text-red-800 text-xs px-2 py-0.5 rounded-full">{alertsSuccess.length}人</span>
          </div>
          <div className="flex-1 flex flex-wrap gap-2 items-center">
            {alertsSuccess.map(item => (
                <div key={item.name} className="flex items-center gap-1.5 bg-white border border-red-100 px-2 py-1 rounded text-xs text-slate-600 shadow-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="font-bold text-red-600">{item.value}%</span>
                    <span className="text-[10px] text-slate-400 scale-90">/ {item.target}%</span>
                </div>
            ))}
          </div>
        </div>
      )}

      {/* 30 Min Dispatch Alerts */}
      {alertsDispatch30.length > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 flex flex-col md:flex-row md:items-center gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-orange-700 font-bold min-w-[180px]">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">30分钟派单率偏低</span>
            <span className="bg-orange-200 text-orange-800 text-xs px-2 py-0.5 rounded-full">{alertsDispatch30.length}人</span>
          </div>
          <div className="flex-1 flex flex-wrap gap-2 items-center">
            {alertsDispatch30.map(item => (
                <div key={item.name} className="flex items-center gap-1.5 bg-white border border-orange-100 px-2 py-1 rounded text-xs text-slate-600 shadow-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="font-bold text-orange-600">{item.value}%</span>
                    <span className="text-[10px] text-slate-400 scale-90">/ {item.target}%</span>
                </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceAlerts;