import { useState, useEffect, useCallback } from 'react';
import {
  getApplications,
  interviewApplication,
  hireApplication,
  hireApplicationWithRenounce,
  rejectApplication,
  pendingHireApplication,
  createAgreement,
  getCounselors,
  checkDuplicateSigning,
} from '../services/api';
import { useAppStore } from '../stores/appStore';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import type { Application, DuplicateSigningBlockDTO } from '../types';

const statusTabs = [
  { key: '', label: '全部' },
  { key: 'PENDING_SCREENING', label: '待筛选' },
  { key: 'INTERVIEWING', label: '待面试' },
  { key: 'PENDING_HIRE', label: '待录用' },
  { key: 'HIRED', label: '已录用' },
  { key: 'REJECTED', label: '已拒绝' },
  { key: 'DEPARTMENT_REVIEW', label: '院系审核' },
  { key: 'AGREEMENT_PENDING', label: '协议中' },
  { key: 'ACTIVE', label: '实习中' },
  { key: 'COMPLETED', label: '已完成' },
  { key: 'RENOUNCED', label: '已放弃' },
];

const steps = ['待筛选', '待面试', '待录用', '已录用', '审核', '协议', '报到'];
const stepStatusMap: Record<string, number> = {
  PENDING_SCREENING: 0, APPLIED: 0, INTERVIEWING: 1, PENDING_HIRE: 2, HIRED: 3, DEPARTMENT_REVIEW: 4, AGREEMENT_PENDING: 5, ACTIVE: 6, COMPLETED: 6, REJECTED: -1, RENOUNCED: -1,
};

export default function Applications() {
  const { currentRole } = useAppStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showInterview, setShowInterview] = useState(false);
  const [interviewForm, setInterviewForm] = useState({ interviewTime: '', interviewLocation: '', interviewMethod: '' });

  const [showDuplicateBlock, setShowDuplicateBlock] = useState(false);
  const [duplicateBlockInfo, setDuplicateBlockInfo] = useState<DuplicateSigningBlockDTO | null>(null);
  const [renounceReason, setRenounceReason] = useState('');
  const [hireLoading, setHireLoading] = useState(false);

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

  const handlePendingHire = async () => {
    if (!selectedApp) return;
    try { await pendingHireApplication(selectedApp.id); fetchApps(); setSelectedApp(null); } catch { /* */ }
  };

  const handleHire = async (id: number) => {
    setHireLoading(true);
    try {
      const app = applications.find(a => a.id === id);
      if (app) {
        const blockInfo = await checkDuplicateSigning(app.studentId, app.jobId);
        if (blockInfo.blocked) {
          setDuplicateBlockInfo(blockInfo);
          setShowDuplicateBlock(true);
          setSelectedApp(app);
          return;
        }
      }
      await hireApplication(id);
      fetchApps();
      setSelectedApp(null);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setDuplicateBlockInfo(err.response.data as DuplicateSigningBlockDTO);
        setShowDuplicateBlock(true);
      }
    } finally {
      setHireLoading(false);
    }
  };

  const handleHireWithRenounce = async () => {
    if (!selectedApp || !duplicateBlockInfo?.existingAgreement) return;
    if (!renounceReason.trim() || renounceReason.trim().length < 10) {
      alert('请详细填写放弃原因（至少10个字符）');
      return;
    }
    setHireLoading(true);
    try {
      const renounceAppId = duplicateBlockInfo.existingAgreement.applicationId;
      await hireApplicationWithRenounce(selectedApp.id, {
        renounceApplicationId: renounceAppId,
        renounceReason: renounceReason.trim(),
      });
      setShowDuplicateBlock(false);
      setDuplicateBlockInfo(null);
      setRenounceReason('');
      fetchApps();
      setSelectedApp(null);
    } catch (err: any) {
      alert(err?.response?.data?.error || '操作失败，请重试');
    } finally {
      setHireLoading(false);
    }
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

      <Modal isOpen={!!selectedApp && !showDuplicateBlock} onClose={() => setSelectedApp(null)} title="申请详情" width="max-w-xl">
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
              <div>
                <span className="text-slate-400">专业匹配:</span>{' '}
                {selectedApp.majorMatched === false ? (
                  <span className="text-amber-600 text-xs font-medium">不匹配</span>
                ) : selectedApp.majorMatched === true ? (
                  <span className="text-green-600 text-xs font-medium">匹配</span>
                ) : (
                  <span className="text-slate-400 text-xs">未知</span>
                )}
              </div>
              <div><span className="text-slate-400">状态:</span> <StatusBadge status={selectedApp.status} type="application" /></div>
              {selectedApp.renounceReason && (
                <div className="col-span-2"><span className="text-slate-400">放弃原因:</span> {selectedApp.renounceReason}</div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              {currentRole === 'enterprise' && selectedApp.status === 'PENDING_SCREENING' && (
                <button onClick={() => setShowInterview(true)} className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm hover:bg-teal-800">安排面试</button>
              )}
              {currentRole === 'enterprise' && selectedApp.status === 'PENDING_SCREENING' && (
                <button onClick={() => handleReject(selectedApp.id)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">拒绝</button>
              )}
              {currentRole === 'enterprise' && selectedApp.status === 'INTERVIEWING' && (
                <>
                  <button onClick={handlePendingHire} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700">标记待录用</button>
                  <button onClick={() => handleReject(selectedApp.id)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">拒绝</button>
                </>
              )}
              {currentRole === 'enterprise' && selectedApp.status === 'PENDING_HIRE' && (
                <button onClick={() => handleHire(selectedApp.id)} disabled={hireLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                  {hireLoading ? '处理中...' : '确认录用'}
                </button>
              )}
              {currentRole === 'employment_office' && selectedApp.status === 'AGREEMENT_PENDING' && (
                <button onClick={handleGenerateAgreement} className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm hover:bg-teal-800">生成三方协议</button>
              )}
              <button onClick={() => setSelectedApp(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">关闭</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showDuplicateBlock} onClose={() => { setShowDuplicateBlock(false); setRenounceReason(''); }} title="⚠️ 重复签约拦截警告" width="max-w-2xl">
        {duplicateBlockInfo && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-700 font-semibold mb-2">{duplicateBlockInfo.message}</div>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-orange-800 font-medium whitespace-pre-wrap">{duplicateBlockInfo.riskWarning}</div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-blue-800 font-medium whitespace-pre-wrap">{duplicateBlockInfo.employmentOfficeRequirement}</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-sm font-semibold text-slate-700 mb-2">📋 现有签约信息</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-slate-500">学生姓名：</span>{duplicateBlockInfo.existingStudentName}</div>
                <div><span className="text-slate-500">签约企业：</span>{duplicateBlockInfo.existingEnterpriseName}</div>
                <div><span className="text-slate-500">签约岗位：</span>{duplicateBlockInfo.existingJobTitle}</div>
                <div>
                  <span className="text-slate-500">协议状态：</span>
                  {duplicateBlockInfo.existingAgreement && (
                    <StatusBadge status={duplicateBlockInfo.existingAgreement.status} type="agreement" />
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                ✍️ 填写放弃原有签约的详细原因 <span className="text-red-500">*（至少10个字符）</span>
              </label>
              <textarea
                value={renounceReason}
                onChange={(e) => setRenounceReason(e.target.value)}
                placeholder="请说明放弃原企业签约的具体原因，例如：新企业岗位更符合个人职业发展规划、薪资待遇更优、家庭原因需要更换实习城市等..."
                rows={4}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
              />
              <div className="text-xs text-slate-500 mt-1">
                当前字数：{renounceReason.trim().length} / 最少10字
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              ⚠️ 重要提示：提交后将自动解除与原企业的三方协议，并被记为一次学生违约，该记录将影响学生诚信档案。
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => { setShowDuplicateBlock(false); setRenounceReason(''); }} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">取消</button>
              <button
                onClick={handleHireWithRenounce}
                disabled={hireLoading || renounceReason.trim().length < 10}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hireLoading ? '处理中...' : '确认放弃并接受新录用'}
              </button>
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
