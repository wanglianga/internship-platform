import { useState, useEffect, useCallback } from 'react';
import { getApplications, interviewApplication, hireApplication, rejectApplication, createAgreement, getCounselors } from '../services/api';
import { useAppStore } from '../stores/appStore';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import type { Application } from '../types';

const statusTabs = [
  { key: '', label: '全部' },
  { key: 'APPLIED', label: '已投递' },
  { key: 'INTERVIEWING', label: '面试中' },
  { key: 'HIRED', label: '已录用' },
  { key: 'REJECTED', label: '已拒绝' },
  { key: 'DEPARTMENT_REVIEW', label: '院系审核' },
  { key: 'AGREEMENT_PENDING', label: '协议中' },
  { key: 'ACTIVE', label: '实习中' },
  { key: 'COMPLETED', label: '已完成' },
];

const steps = ['已投递', '面试', '已录用', '审核', '协议', '报到'];
const stepStatusMap: Record<string, number> = {
  APPLIED: 0, INTERVIEWING: 1, HIRED: 2, DEPARTMENT_REVIEW: 3, AGREEMENT_PENDING: 4, ACTIVE: 5, COMPLETED: 5, REJECTED: -1,
};

export default function Applications() {
  const { currentRole } = useAppStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showInterview, setShowInterview] = useState(false);
  const [interviewForm, setInterviewForm] = useState({ interviewTime: '', interviewLocation: '', interviewMethod: '' });

  const fetchApps = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (activeTab) params.status = activeTab;
    getApplications(params)
      .then(setApplications)
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const handleInterview = async () => {
    if (!selectedApp) return;
    try { await interviewApplication(selectedApp.id, interviewForm); setShowInterview(false); fetchApps(); setSelectedApp(null); } catch { /* */ }
  };

  const handleHire = async (id: number) => {
    try {
      await hireApplication(id);
      fetchApps();
      setSelectedApp(null);
    } catch { /* */ }
  };

  const handleGenerateAgreement = async () => {
    if (!selectedApp) return;
    try {
      await createAgreement({ applicationId: selectedApp.id } as any);
      fetchApps();
      setSelectedApp(null);
    } catch { /* */ }
  };

  const handleReject = async (id: number) => {
    try { await rejectApplication(id); fetchApps(); setSelectedApp(null); } catch { /* */ }
  };

  const currentStep = selectedApp ? stepStatusMap[selectedApp.status] ?? 0 : 0;

  const columns = [
    { key: 'studentName', title: '学生姓名' },
    { key: 'jobTitle', title: '岗位名称' },
    { key: 'appliedAt', title: '投递时间', render: (v: unknown) => v ? new Date(v as string).toLocaleDateString('zh-CN') : '-' },
    { key: 'status', title: '状态', render: (v: unknown) => <StatusBadge status={v as string} type="application" /> },
    {
      key: 'id', title: '进度', render: (_: unknown, record: Application) => {
        const step = stepStatusMap[record.status] ?? 0;
        return (
          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${Math.max(0, (step + 1) / steps.length * 100)}%` }} />
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${activeTab === tab.key ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">加载中...</div>
      ) : (
        <DataTable columns={columns} data={applications} onRowClick={setSelectedApp} />
      )}

      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title="申请详情" width="max-w-xl">
        {selectedApp && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-sm"><span className="text-slate-400">学生:</span> {selectedApp.studentName}</div>
              <div className="text-sm"><span className="text-slate-400">岗位:</span> {selectedApp.jobTitle}</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${i <= currentStep && currentStep >= 0 ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {i + 1}
                  </div>
                  <span className={i <= currentStep && currentStep >= 0 ? 'text-teal-700' : ''}>{step}</span>
                  {i < steps.length - 1 && <div className="w-8 h-0.5 bg-slate-200" />}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-400">专业:</span> {selectedApp.studentMajor || '-'}</div>
              <div><span className="text-slate-400">状态:</span> <StatusBadge status={selectedApp.status} type="application" /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              {currentRole === 'enterprise' && selectedApp.status === 'APPLIED' && (
                <button onClick={() => setShowInterview(true)} className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm hover:bg-teal-800">安排面试</button>
              )}
              {currentRole === 'enterprise' && selectedApp.status === 'INTERVIEWING' && (
                <>
                  <button onClick={() => handleHire(selectedApp.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">确认录用</button>
                  <button onClick={() => handleReject(selectedApp.id)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">拒绝</button>
                </>
              )}
              {currentRole === 'employment_office' && selectedApp.status === 'AGREEMENT_PENDING' && (
                <button onClick={handleGenerateAgreement} className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm hover:bg-teal-800">生成三方协议</button>
              )}
              <button onClick={() => setSelectedApp(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">关闭</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showInterview} onClose={() => setShowInterview(false)} title="安排面试" width="max-w-md">
        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-600 mb-1 block">面试时间</label>
            <input type="datetime-local" value={interviewForm.interviewTime} onChange={(e) => setInterviewForm({ ...interviewForm, interviewTime: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1 block">面试地点</label>
            <input value={interviewForm.interviewLocation} onChange={(e) => setInterviewForm({ ...interviewForm, interviewLocation: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1 block">面试方式</label>
            <select value={interviewForm.interviewMethod} onChange={(e) => setInterviewForm({ ...interviewForm, interviewMethod: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
              <option value="">请选择</option>
              <option value="线上">线上</option>
              <option value="线下">线下</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowInterview(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">取消</button>
            <button onClick={handleInterview} className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm hover:bg-teal-800">确认安排</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
