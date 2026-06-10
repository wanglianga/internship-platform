import { useState, useEffect, useCallback } from 'react';
import { getReviews, approveReview, rejectReview } from '../services/api';
import { useAppStore } from '../stores/appStore';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import type { Review } from '../types';

const typeLabels: Record<string, string> = {
  DEPARTMENT: '院系审核',
  AGREEMENT: '协议审核',
};

export default function Reviews() {
  const { currentRole } = useAppStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'department' | 'agreement' | 'history'>('department');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showAction, setShowAction] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [comment, setComment] = useState('');

  const fetchReviews = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (activeSection === 'department') {
      params.type = 'DEPARTMENT';
      params.status = 'PENDING';
    } else if (activeSection === 'agreement') {
      params.type = 'AGREEMENT';
      params.status = 'PENDING';
    }
    getReviews(params)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [activeSection]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleAction = async () => {
    if (!selectedReview) return;
    try {
      if (actionType === 'approve') {
        await approveReview(selectedReview.id, { comment });
      } else {
        await rejectReview(selectedReview.id, { comment });
      }
      setShowAction(false);
      setComment('');
      setSelectedReview(null);
      fetchReviews();
    } catch { /* */ }
  };

  const openAction = (review: Review, type: 'approve' | 'reject') => {
    setSelectedReview(review);
    setActionType(type);
    setComment('');
    setShowAction(true);
  };

  const columns = [
    { key: 'studentName', title: '学生姓名' },
    { key: 'jobTitle', title: '岗位名称' },
    { key: 'type', title: '审核类型', render: (v: unknown) => <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">{typeLabels[v as string] || String(v)}</span> },
    { key: 'status', title: '状态', render: (v: unknown) => <StatusBadge status={v as string} type="review" /> },
    { key: 'counselorName', title: '审核人', render: (v: unknown) => v ? String(v) : '-' },
    { key: 'reviewedAt', title: '审核时间', render: (v: unknown) => v ? new Date(v as string).toLocaleDateString('zh-CN') : '-' },
  ];

  const pendingColumns = [
    ...columns,
    {
      key: 'actions', title: '操作', render: (_: unknown, record: Review) => (
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); openAction(record, 'approve'); }} className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">通过</button>
          <button onClick={(e) => { e.stopPropagation(); openAction(record, 'reject'); }} className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">拒绝</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex gap-2">
          <button onClick={() => setActiveSection('department')} className={`px-4 py-2 rounded-lg text-sm transition-colors ${activeSection === 'department' ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            院系审核
          </button>
          <button onClick={() => setActiveSection('agreement')} className={`px-4 py-2 rounded-lg text-sm transition-colors ${activeSection === 'agreement' ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            协议审核
          </button>
          <button onClick={() => setActiveSection('history')} className={`px-4 py-2 rounded-lg text-sm transition-colors ${activeSection === 'history' ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            审核历史
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">加载中...</div>
      ) : activeSection === 'history' ? (
        <DataTable columns={columns} data={reviews} />
      ) : (
        <DataTable columns={pendingColumns} data={reviews} onRowClick={setSelectedReview} />
      )}

      <Modal isOpen={showAction} onClose={() => setShowAction(false)} title={actionType === 'approve' ? '审核通过' : '审核拒绝'} width="max-w-md">
        {selectedReview && (
          <div className="space-y-3">
            <div className="text-sm text-slate-600">
              <p>学生: {selectedReview.studentName}</p>
              <p>岗位: {selectedReview.jobTitle}</p>
              <p>类型: {typeLabels[selectedReview.type]}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600 mb-1 block">审核意见</label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="请输入审核意见" rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAction(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">取消</button>
              <button onClick={handleAction} className={`px-4 py-2 text-white rounded-lg text-sm ${actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}`}>
                确认{actionType === 'approve' ? '通过' : '拒绝'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
