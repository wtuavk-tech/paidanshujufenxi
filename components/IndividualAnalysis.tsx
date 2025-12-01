import React, { useMemo } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  Calendar, 
  Clock, 
  CalendarDays,
  X
} from 'lucide-react';
import { DispatcherStats } from '../types';

interface IndividualAnalysisProps {
  user: DispatcherStats;
  onClose: () => void;
}

type MetricType = 'percent' | 'currency' | 'number';

// 格式化数值辅助函数
const formatValue = (val: number, type: MetricType) => {
  if (type === 'percent') return `${val}%`;
  if (type === 'currency') return `¥${val.toLocaleString()}`;
  return val;
};

// 单行数据组件
const ComparisonRow = ({ 
  label, 
  current, 
  previous, 
  type 
}: { 
  label: string, 
  current: number, 
  previous: number, 
  type: MetricType 
}) => {
  const diff = current - previous;
  
  // 计算环比百分比：(本期 - 上期) / 上期 * 100
  let percentRatio = 0;
  if (previous !== 0) {
    percentRatio = ((current - previous) / previous) * 100;
  }

  const isUp = diff > 0;
  const isDown = diff < 0;
  const isNeutral = diff === 0;

  // 红涨绿跌配色逻辑 (中国金融习惯)
  const textColor = isUp ? 'text-red-600' : isDown ? 'text-green-600' : 'text-slate-400';
  const bgColor = isUp ? 'bg-red-50' : isDown ? 'bg-green-50' : 'bg-slate-100';
  const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;

  // 差值显示格式
  let diffDisplay = '';
  if (isNeutral) diffDisplay = '-';
  else if (type === 'percent') diffDisplay = `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`; // 百分点差值
  else if (type === 'currency') diffDisplay = `${diff > 0 ? '+' : ''}${Math.floor(diff)}`;
  else diffDisplay = `${diff > 0 ? '+' : ''}${Math.floor(diff)}`;

  return (
    <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
      <td className="py-3 pl-3 text-sm font-medium text-slate-600">{label}</td>
      <td className="py-3 text-right text-sm text-slate-500 font-mono">{formatValue(previous, type)}</td>
      <td className="py-3 text-right text-sm text-slate-800 font-bold font-mono">{formatValue(current, type)}</td>
      <td className={`py-3 text-right text-sm font-medium font-mono ${textColor}`}>
        {diffDisplay}
      </td>
      <td className="py-3 pr-3 text-right">
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold justify-end min-w-[70px] ${bgColor} ${textColor}`}>
          {!isNeutral && <Icon className="h-3 w-3" strokeWidth={3} />}
          {isNeutral ? '0.0%' : `${Math.abs(percentRatio).toFixed(1)}%`}
        </div>
      </td>
    </tr>
  );
};

// 卡片组件
const TimeFrameCard = ({ 
  title, 
  icon: Icon, 
  currentStats, 
  prevStats,
  labels,
  colorClass
}: { 
  title: string, 
  icon: any, 
  currentStats: any, 
  prevStats: any,
  labels: { prev: string, curr: string },
  colorClass: string
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
    {/* Card Header */}
    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 ${colorClass} bg-opacity-10 rounded-md`}>
          <Icon className={`h-4 w-4 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <h3 className="font-bold text-slate-700 text-sm">{title}</h3>
      </div>
    </div>
    
    {/* Table Header */}
    <div className="p-2">
      <table className="w-full">
        <thead>
          <tr className="text-xs text-slate-400 uppercase tracking-wider">
            <th className="pb-2 pl-3 text-left font-normal w-1/4">指标</th>
            <th className="pb-2 text-right font-normal w-1/6">{labels.prev}</th>
            <th className="pb-2 text-right font-normal w-1/6">{labels.curr}</th>
            <th className="pb-2 text-right font-normal w-1/6">差值</th>
            <th className="pb-2 pr-3 text-right font-normal w-1/4">环比</th>
          </tr>
        </thead>
        <tbody>
          <ComparisonRow 
            label="成单率" 
            current={currentStats.successRate} 
            previous={prevStats.successRate} 
            type="percent" 
          />
          <ComparisonRow 
            label="派单率" 
            current={currentStats.dispatchRate} 
            previous={prevStats.dispatchRate} 
            type="percent" 
          />
          <ComparisonRow 
            label="30分派单" 
            current={currentStats.dispatch30MinRate} 
            previous={prevStats.dispatch30MinRate} 
            type="percent" 
          />
          <ComparisonRow 
            label="每单业绩" 
            current={currentStats.avgRevenue} 
            previous={prevStats.avgRevenue} 
            type="currency" 
          />
          <ComparisonRow 
            label="总单量" 
            current={currentStats.totalOrders} 
            previous={prevStats.totalOrders} 
            type="number" 
          />
        </tbody>
      </table>
    </div>
  </div>
);

const IndividualAnalysis: React.FC<IndividualAnalysisProps> = ({ user, onClose }) => {
  
  // 生成模拟的前一期数据
  const comparisonData = useMemo(() => {
    // 辅助函数：根据当前值和波动范围生成"过去"的值
    // 使得有些上涨，有些下跌
    const generatePrev = (current: number, maxVariancePercent: number) => {
      const variance = (Math.random() * maxVariancePercent * 2) - maxVariancePercent; // e.g., -0.1 to +0.1
      let prev = Math.round(current * (1 + variance));
      // 确保非负
      return Math.max(0, prev);
    };

    // 针对百分比的特殊处理，防止溢出100%
    const generatePrevPercent = (current: number, maxDiff: number) => {
        const diff = Math.floor(Math.random() * maxDiff * 2) - maxDiff; // -10 to +10
        return Math.min(100, Math.max(0, current + diff));
    };

    const createDataSet = (variance: number) => ({
      successRate: generatePrevPercent(user.successRate, 5),
      dispatchRate: generatePrevPercent(user.dispatchRate, 5),
      dispatch30MinRate: generatePrevPercent(user.dispatch30MinRate, 8),
      avgRevenue: generatePrev(user.avgRevenue, variance),
      totalOrders: generatePrev(user.totalOrders, variance),
    });

    return {
      day: createDataSet(0.05),   // 日环比波动小
      week: createDataSet(0.15),  // 周环比波动中
      month: createDataSet(0.25)  // 月环比波动大
    };
  }, [user]);

  return (
    <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md">个人深度分析</span>
            {user.name} 
            <span className="text-slate-400 font-normal text-sm"> | {user.projectCategory}</span>
          </h2>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors"
          title="关闭分析视图"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TimeFrameCard 
          title="日环比数据" 
          icon={Clock} 
          currentStats={user}
          prevStats={comparisonData.day}
          labels={{ prev: '昨日', curr: '今日' }}
          colorClass="text-blue-600 bg-blue-600"
        />
        <TimeFrameCard 
          title="周环比数据" 
          icon={CalendarDays} 
          currentStats={user}
          prevStats={comparisonData.week}
          labels={{ prev: '上周', curr: '本周' }}
          colorClass="text-purple-600 bg-purple-600"
        />
        <TimeFrameCard 
          title="月环比数据" 
          icon={Calendar} 
          currentStats={user}
          prevStats={comparisonData.month}
          labels={{ prev: '上月', curr: '本月' }}
          colorClass="text-orange-600 bg-orange-600"
        />
      </div>
    </div>
  );
};

export default IndividualAnalysis;