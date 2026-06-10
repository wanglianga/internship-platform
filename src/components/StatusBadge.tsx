interface StatusBadgeProps {
  status: string;
  type: 'job' | 'application' | 'agreement' | 'review' | 'risk';
}

const jobStatusMap: Record<string, { label: string; color: string }> = {
  OPEN: { label: '招聘中', color: 'bg-green-100 text-green-700' },
  FILLED: { label: '已满岗', color: 'bg-slate-100 text-slate-600' },
  WITHDRAWN: { label: '已撤岗', color: 'bg-red-100 text-red-600' },
  CLOSED: { label: '已关闭', color: 'bg-slate-100 text-slate-500' },
};

const applicationStatusMap: Record<string, { label: string; color: string }> = {
  APPLIED: { label: '已投递', color: 'bg-blue-100 text-blue-700' },
  INTERVIEWING: { label: '面试中', color: 'bg-orange-100 text-orange-700' },
  HIRED: { label: '已录用', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: '已拒绝', color: 'bg-red-100 text-red-600' },
  DEPARTMENT_REVIEW: { label: '院系审核', color: 'bg-purple-100 text-purple-700' },
  AGREEMENT_PENDING: { label: '协议中', color: 'bg-yellow-100 text-yellow-700' },
  ACTIVE: { label: '实习中', color: 'bg-teal-100 text-teal-700' },
  COMPLETED: { label: '已完成', color: 'bg-slate-100 text-slate-600' },
};

const agreementStatusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待盖章', color: 'bg-yellow-100 text-yellow-700' },
  STAMPED: { label: '已盖章', color: 'bg-blue-100 text-blue-700' },
  ACTIVE: { label: '已生效', color: 'bg-green-100 text-green-700' },
  CHANGING: { label: '变更中', color: 'bg-orange-100 text-orange-700' },
  BREACHED: { label: '已违约', color: 'bg-red-100 text-red-600' },
  COMPLETED: { label: '已完成', color: 'bg-slate-100 text-slate-600' },
};

const reviewStatusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待审核', color: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: '已通过', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: '已拒绝', color: 'bg-red-100 text-red-600' },
};

const riskLevelMap: Record<string, { label: string; color: string }> = {
  HIGH: { label: '高风险', color: 'bg-red-100 text-red-600' },
  MEDIUM: { label: '中风险', color: 'bg-orange-100 text-orange-700' },
  LOW: { label: '低风险', color: 'bg-blue-100 text-blue-700' },
  ACTIVE: { label: '活跃', color: 'bg-red-100 text-red-600' },
  PENDING: { label: '待处理', color: 'bg-yellow-100 text-yellow-700' },
  RESOLVED: { label: '已处理', color: 'bg-green-100 text-green-700' },
};

function getStatusMap(type: StatusBadgeProps['type']) {
  switch (type) {
    case 'job': return jobStatusMap;
    case 'application': return applicationStatusMap;
    case 'agreement': return agreementStatusMap;
    case 'review': return reviewStatusMap;
    case 'risk': return riskLevelMap;
  }
}

export default function StatusBadge({ status, type }: StatusBadgeProps) {
  const map = getStatusMap(type);
  const info = map[status] || { label: status, color: 'bg-slate-100 text-slate-600' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${info.color}`}>
      {info.label}
    </span>
  );
}
