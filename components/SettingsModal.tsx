import React, { useState, useEffect } from 'react';
import { X, Save, Search } from 'lucide-react';
import { UserTarget } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targets: UserTarget[];
  onSave: (newTargets: UserTarget[]) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, targets, onSave }) => {
  const [localTargets, setLocalTargets] = useState<UserTarget[]>(targets);
  const [search, setSearch] = useState('');

  // Sync props to state when modal opens
  useEffect(() => {
    if (isOpen) {
        setLocalTargets(JSON.parse(JSON.stringify(targets)));
    }
  }, [isOpen, targets]);

  const handleChange = (index: number, field: keyof UserTarget, value: string) => {
    const numValue = Math.min(100, Math.max(0, Number(value) || 0));
    const newTargets = [...localTargets];
    newTargets[index] = { ...newTargets[index], [field]: numValue };
    setLocalTargets(newTargets);
  };

  const handleSave = () => {
    onSave(localTargets);
    onClose();
  };

  const filteredTargets = localTargets.filter(t => 
    t.name.includes(search)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">考核标准管理后台</h2>
            <p className="text-sm text-slate-500">设定每位员工的绩效预警阈值</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="搜索姓名..." 
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <div className="text-xs text-slate-400">
                支持搜索员工进行单独设置
            </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">姓名</th>
                <th className="px-4 py-3">成单率目标 (%)</th>
                <th className="px-4 py-3">派单率目标 (%)</th>
                <th className="px-4 py-3 rounded-tr-lg">30分钟派单率目标 (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTargets.map((target) => {
                // Find original index in localTargets to update correctly even when filtered
                const originalIndex = localTargets.findIndex(t => t.id === target.id);
                return (
                    <tr key={target.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-700">{target.name}</td>
                        <td className="px-4 py-2">
                        <input 
                            type="number" 
                            className="w-24 px-2 py-1 border border-slate-200 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            value={target.targetSuccessRate}
                            onChange={(e) => handleChange(originalIndex, 'targetSuccessRate', e.target.value)}
                        />
                        </td>
                        <td className="px-4 py-2">
                        <input 
                            type="number" 
                            className="w-24 px-2 py-1 border border-slate-200 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            value={target.targetDispatchRate}
                            onChange={(e) => handleChange(originalIndex, 'targetDispatchRate', e.target.value)}
                        />
                        </td>
                        <td className="px-4 py-2">
                        <input 
                            type="number" 
                            className="w-24 px-2 py-1 border border-slate-200 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            value={target.targetDispatch30Rate}
                            onChange={(e) => handleChange(originalIndex, 'targetDispatch30Rate', e.target.value)}
                        />
                        </td>
                    </tr>
                );
              })}
            </tbody>
          </table>
          {filteredTargets.length === 0 && (
              <div className="text-center py-10 text-slate-400">未找到相关人员</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm shadow-blue-200 transition-colors"
          >
            <Save className="h-4 w-4" />
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;