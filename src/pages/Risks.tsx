import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, UserCircle, Briefcase, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { getRisks, resolveRisk } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import type { RiskAlert } from '../types';

const typeOptions = [
  { key: '', label: '全部类型' },
  { key: 'MAJOR_MISMATCH', label: '专业不匹配' },
  { key: 'DUPLICATE_SIGNING', label: '重复签约' },
  { key: 'JOB_WITHDRAWN', label: '企业撤岗' },
  { key: 'STUDENT_BREACH', label: '学生违约' },
];

const levelOptions = [
  { key: '', label: '全部等级' },
  { key: 'HIGH', label: '高风险' },
  { key: 'MEDIUM', label: '中风险' },
  { key: 'LOW', label: '低风险' },
];

const statusOptions = [
  { key: '', label: '全部状态' },
  { key: 'ACTIVE', label: '活跃' },
  { key: 'RESOLVED', label: '已处理' },
];

const typeLabels: Record<string, string> = {
  MAJOR_MISMATCH: '专业不匹配',
  DUPLICATE_SIGNING: '重复签约',
  JOB_WITHDRAWN: '企业撤岗',
  STUDENT_BREACH: '学生违约',
};

const levelColors: Record<string, string> = {
  HIGH: 'border-l-red-500',
  MEDIUM: 'border-l-orange-500',
  LOW: 'border-l-blue-500',
};

const typeIcons: Record<string, typeof AlertTriangle> = {
  MAJOR_MISMATCH: Shield,
  DUPLICATE_SIGNING: AlertTriangle,
  JOB_WITHDRAWN: Briefcase,
  STUDENT_BREACH: UserCircle,
};

export default function Risks() {
  const [risks, setRisks] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showResolve, setShowResolve] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<RiskAlert | null>(null);
  const [resolution, setResolution] = useState('');

  const fetchRisks = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (typeFilter) params.type = typeFilter;
    if (levelFilter) params.level = levelFilter;
    if (statusFilter) params.status = statusFilter;
    getRisks(params)
      .then(setRisks)
      .catch(() => setRisks([]))
      .finally(() => setLoading(false));
  }, [typeFilter, levelFilter, statusFilter]);

  useEffect(() => { fetchRisks(); }, [fetchRisks]);

  const handleResolve = async () => {
    if (!selectedRisk) return;
    try {
      await resolveRisk(selectedRisk.id, { resolution });
      setShowResolve(false);
      setResolution('');
      setSelectedRisk(null);
      fetchRisks();
    } catch { /* */ }
  };

  return (
    <div className="flex gap-6">
      <div className="w-56 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600 mb-2 block">风险类型</label>
            <div className="space-y-1">
              {typeOptions.map((opt) => (
                <button key={opt.key} onClick={() => setTypeFilter(opt.key)} className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${typeFilter === opt.key ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-2 block">风险等级</label>
            <div className="space-y-1">
              {levelOptions.map((opt) => (
                <button key={opt.key} onClick={() => setLevelFilter(opt.key)} className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${levelFilter === opt.key ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-2 block">状态</label>
            <div className="space-y-1">
              {statusOptions.map((opt) => (
                <button key={opt.key} onClick={() => setStatusFilter(opt.key)} className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${statusFilter === opt.key ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400">加载中...</div>
        ) : risks.length === 0 ? (
          <div className="text-center py-12 text-slate-400">暂无风险提醒</div>
        ) : (
          risks.map((risk) => {
            const IconComp = typeIcons[risk.type] || AlertTriangle;
            return (
              <div key={risk.id} className={`bg-white rounded-xl shadow-sm border border-slate-100 border-l-4 ${levelColors[risk.level]} p-4 ${risk.level === 'HIGH' && risk.status === 'ACTIVE' ? 'animate-pulse-risk' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      risk.level === 'HIGH' ? 'bg-red-50 text-red-500' : risk.level === 'MEDIUM' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'
                    }`}>
                      <IconComp size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-800">{typeLabels[risk.type] || risk.type}</span>
                        <StatusBadge status={risk.level} type="risk" />
                        <StatusBadge status={risk.status} type="risk" />
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{risk.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><UserCircle size={12} /> {risk.studentName}</span>
                        <span className="flex items-center gap-1"><Briefcase size={12} /> {risk.jobTitle}</span>
                        <span>检测时间: {risk.detectedAt ? format(new Date(risk.detectedAt), 'yyyy-MM-dd HH:mm') : '-'}</span>
                      </div>
                    </div>
                  </div>
                  {risk.status === 'ACTIVE' && (
                    <button onClick={() => { setSelectedRisk(risk); setShowResolve(true); }} className="px-3 py-1.5 bg-teal-700 text-white rounded-lg text-xs hover:bg-teal-800 transition-colors">
                      处理
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal isOpen={showResolve} onClose={() => setShowResolve(false)} title="处理风险" width="max-w-md">
        <div className="space-y-3">
          {selectedRisk && (
            <div className="text-sm text-slate-600 p-3 bg-slate-50 rounded-lg">{selectedRisk.description}</div>
          )}
          <textarea value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="请输入处理说明" rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowResolve(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">取消</button>
            <button onClick={handleResolve} className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm hover:bg-teal-800">确认处理</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
