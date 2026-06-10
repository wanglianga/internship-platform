import { useState, useEffect, useCallback } from 'react';
import { getAgreements, stampAgreement, changeAgreement, breachAgreement, activateAgreement, completeAgreement } from '../services/api';
import { useAppStore } from '../stores/appStore';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import type { Agreement } from '../types';

const statusTabs = [
  { key: '', label: '全部' },
  { key: 'PENDING', label: '待盖章' },
  { key: 'STAMPED', label: '已盖章' },
  { key: 'ACTIVE', label: '已生效' },
  { key: 'CHANGING', label: '变更中' },
  { key: 'BREACHED', label: '已违约' },
  { key: 'COMPLETED', label: '已完成' },
];

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

      <Modal isOpen={!!selectedAgreement} onClose={() => setSelectedAgreement(null)} title="协议详情" width="max-w-xl">
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
            {selectedAgreement.changeReason && (
              <div className="text-sm"><span className="text-slate-400">变更原因:</span> {selectedAgreement.changeReason}</div>
            )}
            {selectedAgreement.breachReason && (
              <div className="text-sm"><span className="text-slate-400">违约原因:</span> {selectedAgreement.breachReason}</div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              {currentRole === 'employment_office' && selectedAgreement.status === 'PENDING' && (
                <button onClick={() => handleStamp(selectedAgreement.id)} className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm hover:bg-teal-800">盖章通过</button>
              )}
              {currentRole === 'employment_office' && selectedAgreement.status === 'STAMPED' && (
                <button onClick={() => handleActivate(selectedAgreement.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">协议生效</button>
              )}
              {(selectedAgreement.status === 'ACTIVE' || selectedAgreement.status === 'STAMPED') && (
                <button onClick={() => setShowChange(true)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">发起变更</button>
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
