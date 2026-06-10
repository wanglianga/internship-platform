import { useState, useEffect, useCallback } from 'react';
import {
  getAgreements,
  stampAgreement,
  changeAgreement,
  breachAgreement,
  activateAgreement,
  completeAgreement,
  createChangeRequest,
  getChangeRequests,
  confirmChangeRequest,
  rejectChangeRequest,
  getAgreementVersions,
  getCounselors,
} from '../services/api';
import { useAppStore } from '../stores/appStore';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import type { Agreement, AgreementChangeRequest, AgreementVersion, Counselor } from '../types';

const statusTabs = [
  { key: '', label: '全部' },
  { key: 'PENDING', label: '待盖章' },
  { key: 'STAMPED', label: '已盖章' },
  { key: 'ACTIVE', label: '已生效' },
  { key: 'CHANGING', label: '变更中' },
  { key: 'BREACHED', label: '已违约' },
  { key: 'COMPLETED', label: '已完成' },
];

const changeRequestStatusLabel: Record<string, string> = {
  PENDING: '待确认',
  ENTERPRISE_CONFIRMED: '企业已确认',
  STUDENT_CONFIRMED: '学生已确认',
  COUNSELOR_CONFIRMED: '辅导员已确认',
  COMPLETED: '变更完成',
  REJECTED: '已驳回',
};

export default function Agreements() {
  const { currentRole } = useAppStore();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [showChange, setShowChange] = useState(false);
  const [showBreach, setShowBreach] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [breachForm, setBreachForm] = useState({ breachReason: '', breachParty: '' });

  const [changeForm, setChangeForm] = useState({
    changeReason: '',
    newLocation: '',
    newSalaryRange: '',
    newMentorName: '',
    newReportTime: '',
  });
  const [showAdvancedChange, setShowAdvancedChange] = useState(false);
  const [changeRequests, setChangeRequests] = useState<AgreementChangeRequest[]>([]);
  const [agreementVersions, setAgreementVersions] = useState<AgreementVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [showChangeRequests, setShowChangeRequests] = useState(false);
  const [selectedChangeRequest, setSelectedChangeRequest] = useState<AgreementChangeRequest | null>(null);
  const [showConfirmChange, setShowConfirmChange] = useState(false);
  const [confirmComment, setConfirmComment] = useState('');
  const [showRejectChange, setShowRejectChange] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [selectedCounselorId, setSelectedCounselorId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAgreements = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (activeTab) params.status = activeTab;
    getAgreements(params)
      .then(setAgreements)
      .catch(() => setAgreements([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  useEffect(() => { fetchAgreements(); }, [fetchAgreements]);
  useEffect(() => {
    getCounselors().then(setCounselors).catch(() => {});
  }, []);

  const handleStamp = async (id: number) => {
    try { await stampAgreement(id); fetchAgreements(); setSelectedAgreement(null); } catch { /* */ }
  };

  const handleChange = async () => {
    if (!selectedAgreement) return;
    try { await changeAgreement(selectedAgreement.id, { changeReason }); setShowChange(false); setChangeReason(''); fetchAgreements(); } catch { /* */ }
  };

  const handleBreach = async () => {
    if (!selectedAgreement) return;
    try { await breachAgreement(selectedAgreement.id, breachForm); setShowBreach(false); setBreachForm({ breachReason: '', breachParty: '' }); fetchAgreements(); setSelectedAgreement(null); } catch { /* */ }
  };

  const handleActivate = async (id: number) => {
    try { await activateAgreement(id); fetchAgreements(); setSelectedAgreement(null); } catch { /* */ }
  };

  const handleComplete = async (id: number) => {
    try { await completeAgreement(id); fetchAgreements(); setSelectedAgreement(null); } catch { /* */ }
  };

  const openAdvancedChange = () => {
    if (!selectedAgreement) return;
    setChangeForm({
      changeReason: '',
      newLocation: selectedAgreement.location || '',
      newSalaryRange: selectedAgreement.salaryRange || '',
      newMentorName: selectedAgreement.mentorName || '',
      newReportTime: selectedAgreement.reportTime || '',
    });
    setShowAdvancedChange(true);
    setShowChange(false);
  };

  const handleSubmitChangeRequest = async () => {
    if (!selectedAgreement) return;
    if (!changeForm.changeReason.trim()) {
      alert('请填写变更原因');
      return;
    }
    setActionLoading(true);
    try {
      await createChangeRequest({
        agreementId: selectedAgreement.id,
        initiatedBy: 1,
        changeReason: changeForm.changeReason,
        newLocation: changeForm.newLocation || undefined,
        newSalaryRange: changeForm.newSalaryRange || undefined,
        newMentorName: changeForm.newMentorName || undefined,
        newReportTime: changeForm.newReportTime || undefined,
      });
      setShowAdvancedChange(false);
      setChangeForm({ changeReason: '', newLocation: '', newSalaryRange: '', newMentorName: '', newReportTime: '' });
      fetchAgreements();
      alert('变更申请已提交，等待四方确认');
    } catch (err: any) {
      alert(err?.response?.data?.error || '提交失败');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchChangeRequests = async (agreementId: number) => {
    try {
      const data = await getChangeRequests({ agreementId: String(agreementId) });
      setChangeRequests(data);
      setShowChangeRequests(true);
    } catch { /* */ }
  };

  const fetchVersions = async (agreementId: number) => {
    try {
      const data = await getAgreementVersions(agreementId);
      setAgreementVersions(data);
      setShowVersions(true);
    } catch { /* */ }
  };

  const handleConfirmChange = async () => {
    if (!selectedChangeRequest) return;
    let role = '';
    switch (currentRole) {
      case 'enterprise': role = 'ENTERPRISE'; break;
      case 'student': role = 'STUDENT'; break;
      case 'counselor': role = 'COUNSELOR'; break;
      case 'employment_office': role = 'EMPLOYMENT_OFFICE'; break;
      default:
        alert('当前角色无权确认变更');
        return;
    }
    setActionLoading(true);
    try {
      await confirmChangeRequest(selectedChangeRequest.id, {
        role,
        comment: confirmComment,
        counselorId: role === 'COUNSELOR' ? (selectedCounselorId || 1) : undefined,
      });
      setShowConfirmChange(false);
      setConfirmComment('');
      if (selectedAgreement) {
        fetchChangeRequests(selectedAgreement.id);
      }
      fetchAgreements();
      alert('确认成功');
    } catch (err: any) {
      alert(err?.response?.data?.error || '确认失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectChange = async () => {
    if (!selectedChangeRequest) return;
    if (!rejectReason.trim()) {
      alert('请填写驳回原因');
      return;
    }
    let role = '';
    switch (currentRole) {
      case 'enterprise': role = 'ENTERPRISE'; break;
      case 'student': role = 'STUDENT'; break;
      case 'counselor': role = 'COUNSELOR'; break;
      case 'employment_office': role = 'EMPLOYMENT_OFFICE'; break;
      default:
        alert('当前角色无权驳回变更');
        return;
    }
    setActionLoading(true);
    try {
      await rejectChangeRequest(selectedChangeRequest.id, { role, rejectionReason: rejectReason });
      setShowRejectChange(false);
      setRejectReason('');
      if (selectedAgreement) {
        fetchChangeRequests(selectedAgreement.id);
      }
      fetchAgreements();
      alert('已驳回变更申请');
    } catch (err: any) {
      alert(err?.response?.data?.error || '操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  const renderConfirmStep = (
    label: string,
    confirmed: boolean,
    confirmedAt?: string,
    comment?: string,
  ) => (
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${confirmed ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
        {confirmed ? '✓' : '○'}
      </div>
      <div className="flex-1">
        <div className={`text-sm font-medium ${confirmed ? 'text-green-700' : 'text-slate-600'}`}>
          {label} {confirmed ? ' - 已确认' : ' - 待确认'}
        </div>
        {confirmedAt && (
          <div className="text-xs text-slate-500 mt-0.5">确认时间：{new Date(confirmedAt).toLocaleString('zh-CN')}</div>
        )}
        {comment && (
          <div className="text-xs text-slate-600 mt-1 bg-slate-50 rounded px-2 py-1">备注：{comment}</div>
        )}
      </div>
    </div>
  );

  const columns = [
    { key: 'studentName', title: '学生姓名' },
    { key: 'jobTitle', title: '岗位名称' },
    { key: 'enterpriseName', title: '企业名称' },
    { key: 'status', title: '状态', render: (v: unknown) => <StatusBadge status={v as string} type="agreement" /> },
    { key: 'generatedAt', title: '生成日期', render: (v: unknown) => v ? new Date(v as string).toLocaleDateString('zh-CN') : '-' },
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
        <DataTable columns={columns} data={agreements} onRowClick={setSelectedAgreement} />
      )}

      <Modal isOpen={!!selectedAgreement && !showAdvancedChange && !showChangeRequests && !showVersions} onClose={() => setSelectedAgreement(null)} title="协议详情" width="max-w-2xl">
        {selectedAgreement && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-400">学生:</span> {selectedAgreement.studentName}</div>
              <div><span className="text-slate-400">岗位:</span> {selectedAgreement.jobTitle}</div>
              <div><span className="text-slate-400">企业:</span> {selectedAgreement.enterpriseName}</div>
              <div><span className="text-slate-400">状态:</span> <StatusBadge status={selectedAgreement.status} type="agreement" /></div>
              <div><span className="text-slate-400">生成日期:</span> {selectedAgreement.generatedAt ? new Date(selectedAgreement.generatedAt).toLocaleDateString('zh-CN') : '-'}</div>
              <div><span className="text-slate-400">盖章日期:</span> {selectedAgreement.stampedAt ? new Date(selectedAgreement.stampedAt).toLocaleDateString('zh-CN') : '-'}</div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="text-sm font-semibold text-slate-700 mb-2">📋 协议关键信息快照 {selectedAgreement.currentVersion ? `（v${selectedAgreement.currentVersion}）` : ''}</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-500">实习地点:</span> <span className="font-medium">{selectedAgreement.location || '-'}</span></div>
                <div><span className="text-slate-500">薪资范围:</span> <span className="font-medium">{selectedAgreement.salaryRange || '-'}</span></div>
                <div><span className="text-slate-500">企业导师:</span> <span className="font-medium">{selectedAgreement.mentorName || '-'}</span></div>
                <div><span className="text-slate-500">报到时间:</span> <span className="font-medium">{selectedAgreement.reportTime || '-'}</span></div>
              </div>
            </div>

            {selectedAgreement.changeReason && (
              <div className="text-sm"><span className="text-slate-400">变更原因:</span> {selectedAgreement.changeReason}</div>
            )}
            {selectedAgreement.breachReason && (
              <div className="text-sm"><span className="text-slate-400">违约原因:</span> {selectedAgreement.breachReason}</div>
            )}

            <div className="flex gap-2 flex-wrap">
              <button onClick={() => fetchVersions(selectedAgreement.id)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                📜 查看版本历史
              </button>
              <button onClick={() => fetchChangeRequests(selectedAgreement.id)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                🔄 查看变更记录
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              {currentRole === 'employment_office' && selectedAgreement.status === 'PENDING' && (
                <button onClick={() => handleStamp(selectedAgreement.id)} className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm hover:bg-teal-800">盖章通过</button>
              )}
              {currentRole === 'employment_office' && selectedAgreement.status === 'STAMPED' && (
                <button onClick={() => handleActivate(selectedAgreement.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">协议生效</button>
              )}
              {(selectedAgreement.status === 'ACTIVE' || selectedAgreement.status === 'STAMPED') && (
                <button onClick={openAdvancedChange} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">发起变更</button>
              )}
              {selectedAgreement.status === 'ACTIVE' && (
                <button onClick={() => setShowBreach(true)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">处理违约</button>
              )}
              {selectedAgreement.status === 'ACTIVE' && (
                <button onClick={() => handleComplete(selectedAgreement.id)} className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm hover:bg-teal-800">实习报到</button>
              )}
              <button onClick={() => setSelectedAgreement(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">关闭</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showAdvancedChange} onClose={() => setShowAdvancedChange(false)} title="发起协议变更申请" width="max-w-2xl">
        {selectedAgreement && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              协议变更需要<b>企业、学生、辅导员、就业办</b>四方确认通过后方可生效。变更前后的协议版本将永久留存归档。
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">📍 实习地点</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                    <div className="text-xs text-slate-500">当前值</div>
                    <div className="font-medium">{selectedAgreement.location || '-'}</div>
                  </div>
                  <input
                    value={changeForm.newLocation}
                    onChange={(e) => setChangeForm({ ...changeForm, newLocation: e.target.value })}
                    placeholder="输入新的实习地点"
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">💰 薪资范围</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                    <div className="text-xs text-slate-500">当前值</div>
                    <div className="font-medium">{selectedAgreement.salaryRange || '-'}</div>
                  </div>
                  <input
                    value={changeForm.newSalaryRange}
                    onChange={(e) => setChangeForm({ ...changeForm, newSalaryRange: e.target.value })}
                    placeholder="输入新的薪资范围"
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">👨‍💼 企业导师</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                    <div className="text-xs text-slate-500">当前值</div>
                    <div className="font-medium">{selectedAgreement.mentorName || '-'}</div>
                  </div>
                  <input
                    value={changeForm.newMentorName}
                    onChange={(e) => setChangeForm({ ...changeForm, newMentorName: e.target.value })}
                    placeholder="输入新的导师姓名"
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">📅 报到时间</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                    <div className="text-xs text-slate-500">当前值</div>
                    <div className="font-medium">{selectedAgreement.reportTime || '-'}</div>
                  </div>
                  <input
                    type="date"
                    value={changeForm.newReportTime}
                    onChange={(e) => setChangeForm({ ...changeForm, newReportTime: e.target.value })}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">变更原因 <span className="text-red-500">*</span></label>
              <textarea
                value={changeForm.changeReason}
                onChange={(e) => setChangeForm({ ...changeForm, changeReason: e.target.value })}
                placeholder="请详细说明协议变更的原因..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAdvancedChange(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">取消</button>
              <button onClick={handleSubmitChangeRequest} disabled={actionLoading} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 disabled:opacity-50">
                {actionLoading ? '提交中...' : '提交变更申请'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showVersions} onClose={() => setShowVersions(false)} title="📜 协议版本历史" width="max-w-2xl">
        <div className="space-y-3">
          {agreementVersions.length === 0 ? (
            <div className="text-center py-8 text-slate-400">暂无版本历史</div>
          ) : (
            <div className="relative">
              {agreementVersions.map((v, idx) => (
                <div key={v.id} className={`relative pl-8 pb-6 ${idx < agreementVersions.length - 1 ? 'border-l-2 border-slate-200 ml-3' : 'ml-3'}`}>
                  <div className={`absolute -left-[5px] top-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${idx === 0 ? 'bg-teal-600' : 'bg-slate-400'}`}>
                    {idx === 0 ? '★' : v.versionNumber}
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-slate-800">
                        v{v.versionNumber} {idx === 0 && <span className="ml-2 px-2 py-0.5 bg-teal-100 text-teal-700 rounded text-xs">当前版本</span>}
                      </div>
                      <div className="text-xs text-slate-500">{new Date(v.createdAt).toLocaleString('zh-CN')}</div>
                    </div>
                    <div className="text-sm text-slate-600 mb-2 italic">{v.changeDescription}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>📍 地点: <span className="font-medium">{v.location || '-'}</span></div>
                      <div>💰 薪资: <span className="font-medium">{v.salaryRange || '-'}</span></div>
                      <div>👨‍💼 导师: <span className="font-medium">{v.mentorName || '-'}</span></div>
                      <div>📅 报到: <span className="font-medium">{v.reportTime || '-'}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button onClick={() => setShowVersions(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">关闭</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showChangeRequests} onClose={() => setShowChangeRequests(false)} title="🔄 协议变更记录" width="max-w-2xl">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {changeRequests.length === 0 ? (
            <div className="text-center py-8 text-slate-400">暂无变更记录</div>
          ) : (
            changeRequests.map((req) => (
              <div key={req.id} className="p-4 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      req.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      req.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {changeRequestStatusLabel[req.status] || req.status}
                    </span>
                    <span className="ml-2 text-xs text-slate-500">
                      发起于 {new Date(req.initiatedAt).toLocaleString('zh-CN')}
                      {req.initiatedByName && ` · ${req.initiatedByName}`}
                    </span>
                  </div>
                  {(req.status !== 'COMPLETED' && req.status !== 'REJECTED') && (
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedChangeRequest(req); setShowConfirmChange(true); }} className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">确认</button>
                      <button onClick={() => { setSelectedChangeRequest(req); setShowRejectChange(true); }} className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">驳回</button>
                    </div>
                  )}
                </div>

                <div className="text-sm text-slate-700 bg-slate-50 rounded px-3 py-2">
                  <span className="font-medium">变更原因：</span>{req.changeReason}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {req.originalLocation !== req.newLocation && (
                    <div className="col-span-2">📍 地点: <span className="line-through text-slate-400">{req.originalLocation}</span> <span className="mx-2">→</span> <span className="font-medium text-orange-700">{req.newLocation}</span></div>
                  )}
                  {req.originalSalaryRange !== req.newSalaryRange && (
                    <div className="col-span-2">💰 薪资: <span className="line-through text-slate-400">{req.originalSalaryRange}</span> <span className="mx-2">→</span> <span className="font-medium text-orange-700">{req.newSalaryRange}</span></div>
                  )}
                  {req.originalMentorName !== req.newMentorName && (
                    <div className="col-span-2">👨‍💼 导师: <span className="line-through text-slate-400">{req.originalMentorName}</span> <span className="mx-2">→</span> <span className="font-medium text-orange-700">{req.newMentorName}</span></div>
                  )}
                  {req.originalReportTime !== req.newReportTime && (
                    <div className="col-span-2">📅 报到: <span className="line-through text-slate-400">{req.originalReportTime}</span> <span className="mx-2">→</span> <span className="font-medium text-orange-700">{req.newReportTime}</span></div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="text-xs font-semibold text-slate-600 mb-2">四方确认进度：</div>
                  {renderConfirmStep('🏢 企业确认', req.enterpriseConfirmed, req.enterpriseConfirmedAt, req.enterpriseComment)}
                  {renderConfirmStep('🎓 学生确认', req.studentConfirmed, req.studentConfirmedAt, req.studentComment)}
                  {renderConfirmStep('👩‍🏫 辅导员确认', req.counselorConfirmed, req.counselorConfirmedAt, req.counselorComment)}
                  {renderConfirmStep('🏛️ 就业办确认', req.employmentOfficeConfirmed, req.employmentOfficeConfirmedAt, req.employmentOfficeComment)}
                </div>

                {req.rejectionReason && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    <b>驳回原因：</b>{req.rejectionReason}
                  </div>
                )}
              </div>
            ))
          )}
          <div className="flex justify-end pt-2 border-t border-slate-100 sticky bottom-0 bg-white">
            <button onClick={() => setShowChangeRequests(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">关闭</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showConfirmChange} onClose={() => setShowConfirmChange(false)} title="确认变更申请" width="max-w-md">
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
            作为 <b>{currentRole === 'enterprise' ? '企业导师' : currentRole === 'student' ? '学生' : currentRole === 'counselor' ? '辅导员' : '就业办'}</b>，确认此协议变更内容。
          </div>

          {currentRole === 'counselor' && counselors.length > 0 && (
            <div>
              <label className="text-sm text-slate-600 mb-1 block">选择辅导员</label>
              <select
                value={selectedCounselorId ?? ''}
                onChange={(e) => setSelectedCounselorId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
              >
                <option value="">请选择</option>
                {counselors.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} - {c.department}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm text-slate-600 mb-1 block">确认备注（选填）</label>
            <textarea
              value={confirmComment}
              onChange={(e) => setConfirmComment(e.target.value)}
              placeholder="输入确认意见或备注..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowConfirmChange(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">取消</button>
            <button onClick={handleConfirmChange} disabled={actionLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
              {actionLoading ? '确认中...' : '确认'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showRejectChange} onClose={() => setShowRejectChange(false)} title="驳回变更申请" width="max-w-md">
        <div className="space-y-3">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            请填写驳回变更申请的具体原因，该原因将通知相关各方。
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1 block">驳回原因 <span className="text-red-500">*</span></label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="请详细说明驳回的原因..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowRejectChange(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">取消</button>
            <button onClick={handleRejectChange} disabled={actionLoading || !rejectReason.trim()} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50">
              {actionLoading ? '提交中...' : '确认驳回'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showChange} onClose={() => setShowChange(false)} title="发起变更" width="max-w-md">
        <div className="space-y-3">
          <textarea value={changeReason} onChange={(e) => setChangeReason(e.target.value)} placeholder="请输入变更原因" rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowChange(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">取消</button>
            <button onClick={handleChange} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">提交变更</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showBreach} onClose={() => setShowBreach(false)} title="处理违约" width="max-w-md">
        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-600 mb-1 block">违约方</label>
            <select value={breachForm.breachParty} onChange={(e) => setBreachForm({ ...breachForm, breachParty: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
              <option value="">请选择</option>
              <option value="学生">学生</option>
              <option value="企业">企业</option>
            </select>
          </div>
          <textarea value={breachForm.breachReason} onChange={(e) => setBreachForm({ ...breachForm, breachReason: e.target.value })} placeholder="请输入违约原因" rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowBreach(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">取消</button>
            <button onClick={handleBreach} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">确认违约</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
