import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { DispatcherStats } from '../types';

interface ComparisonChartsProps {
  selectedData: DispatcherStats[];
}

// 可复用的单项指标图表组件
const MetricChart = ({ 
  title, 
  data, 
  dataKey, 
  color, 
  unit = '',
  yDomain
}: { 
  title: string, 
  data: any[], 
  dataKey: string, 
  color: string, 
  unit?: string,
  yDomain?: [number, number] | [number, 'auto']
}) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-md transition-shadow">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-5 rounded-full" style={{ backgroundColor: color }}></div>
      <h3 className="text-sm font-bold text-slate-700">{title}</h3>
    </div>
    
    <div className="h-48 flex-grow">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          barSize={Math.max(20, 100 / data.length)} // 动态调整柱子宽度
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false}
            interval={0} 
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            domain={yDomain || [0, 'auto']}
            tickFormatter={(value) => `${value}${unit.replace('¥', '')}`} // 简化Y轴显示
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
            formatter={(value: number) => [`${unit}${value}${unit === '%' ? '' : ''}`, title]}
          />
          <Bar 
            dataKey={dataKey} 
            fill={color} 
            radius={[4, 4, 0, 0]} 
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const ComparisonCharts: React.FC<ComparisonChartsProps> = ({ selectedData }) => {
  if (selectedData.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-in slide-in-from-top-4 duration-500">
      {/* 1. 成单率对比 */}
      <MetricChart 
        title="成单率对比" 
        data={selectedData} 
        dataKey="successRate" 
        color="#3b82f6" // Blue
        unit="%" 
        yDomain={[0, 100]}
      />

      {/* 2. 派单率对比 */}
      <MetricChart 
        title="派单率对比" 
        data={selectedData} 
        dataKey="dispatchRate" 
        color="#10b981" // Emerald
        unit="%" 
        yDomain={[0, 100]}
      />

      {/* 3. 30分钟派单率对比 */}
      <MetricChart 
        title="30分钟派单率对比" 
        data={selectedData} 
        dataKey="dispatch30MinRate" 
        color="#8b5cf6" // Violet
        unit="%" 
        yDomain={[0, 100]}
      />

      {/* 4. 平均业绩对比 */}
      <MetricChart 
        title="每单业绩对比" 
        data={selectedData} 
        dataKey="avgRevenue" 
        color="#f59e0b" // Amber
        unit="¥" 
      />

      {/* 5. 总单量对比 */}
      <MetricChart 
        title="总单量对比" 
        data={selectedData} 
        dataKey="totalOrders" 
        color="#6366f1" // Indigo
        unit="" 
      />
      
      {/* 这是一个占位卡片，如果只有5个图表，最后一个位置可以放统计摘要或者留空 */}
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col justify-center items-center text-center">
        <p className="text-slate-400 text-sm font-medium">共对比 {selectedData.length} 位成员</p>
        <p className="text-slate-400 text-xs mt-1">数据基于所选时间范围</p>
      </div>
    </div>
  );
};

export default ComparisonCharts;