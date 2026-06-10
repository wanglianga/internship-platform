import { useState, useEffect } from 'react';
import { Briefcase, FileText, ClipboardCheck, FileCheck, AlertTriangle, Clock, ArrowRight, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { getDashboard } from '../services/api';
import type { DashboardData } from '../types';

const levelColorMap: Record<string, string> = {
  HIGH: 'border-l-red-500',
  MEDIUM: 'border-l-orange-500',
  LOW: 'border-l-blue-500',
};

const levelBgMap: Record<string, string> = {
  HIGH: 'bg-red-50',
  MEDIUM: 'bg-orange-50',
  LOW: 'bg-blue-50',
};

const levelTextMap: Record<string, string> = {
  HIGH: 'text-red-700',
  MEDIUM: 'text-orange-700',
  LOW: 'text-blue-700',
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="flex items-center justify-center h-64 text-slate-400">暂无数据</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="岗位总数" value={data.stats.jobCount} icon={<Briefcase size={22} />} gradient="stat-card-gradient-1" delay={0} />
        <StatCard title="投递总数" value={data.stats.applicationCount} icon={<FileText size={22} />} gradient="stat-card-gradient-2" delay={80} />
        <StatCard title="待审核" value={data.stats.pendingReviewCount} icon={<ClipboardCheck size={22} />} gradient="stat-card-gradient-3" delay={160} />
        <StatCard title="活跃协议" value={data.stats.activeAgreementCount} icon={<FileCheck size={22} />} gradient="stat-card-gradient-4" delay={240} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100/80 p-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <div className="w-1 h-5 rounded-full gradient-teal" />
              待办事项
            </h3>
            <Link to="/applications" className="text-teal-600 hover:text-teal-700 transition-colors">
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="space-y-2">
            {[...(data.recentApplications || []), ...(data.pendingReviews || [])].slice(0, 8).length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">暂无待办</p>
            ) : (
              [...(data.recentApplications || []), ...(data.pendingReviews || [])].slice(0, 8).map((item, idx) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors group" style={{ animationDelay: `${350 + idx * 50}ms` }}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    item.urgency === 'HIGH' ? 'bg-red-500' : item.urgency === 'MEDIUM' ? 'bg-orange-500' : 'bg-blue-500'
                  }`} />
                  <span className="text-sm text-slate-700 flex-1 truncate">{item.title}</span>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{item.type}</span>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100/80 p-5 animate-fade-in-up" style={{ animationDelay: '380ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <div className="w-1 h-5 rounded-full gradient-warm" />
              风险提醒
            </h3>
            <Link to="/risks" className="text-orange-500 hover:text-orange-600 transition-colors">
              <AlertTriangle size={16} />
            </Link>
          </div>
          <div className="space-y-3">
            {(data.activeRisks || []).length === 0 ? (
              <div className="flex flex-col items-center py-6 text-slate-400">
                <AlertTriangle size={24} className="mb-2 opacity-40" />
                <p className="text-sm">暂无活跃风险</p>
              </div>
            ) : (
              (data.activeRisks || []).map((risk, idx) => (
                <div key={risk.id} className={`rounded-lg border-l-4 ${levelColorMap[risk.level] || 'border-l-slate-300'} ${levelBgMap[risk.level] || 'bg-slate-50'} p-3 transition-all hover:shadow-sm`} style={{ animationDelay: `${400 + idx * 60}ms` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold ${levelTextMap[risk.level] || 'text-slate-600'}`}>
                      {risk.level === 'HIGH' ? '高危' : risk.level === 'MEDIUM' ? '中危' : '低危'}
                    </span>
                    <span className="text-xs text-slate-500">{risk.type}</span>
                  </div>
                  <p className="text-sm text-slate-700 line-clamp-2">{risk.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100/80 p-5 animate-fade-in-up" style={{ animationDelay: '440ms' }}>
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-blue-500" />
          最近动态
        </h3>
        <div className="space-y-3">
          {(data.recentActivities || []).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">暂无动态</p>
          ) : (
            (data.recentActivities || []).map((activity, idx) => (
              <div key={activity.id} className="flex items-start gap-3 group" style={{ animationDelay: `${480 + idx * 40}ms` }}>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center flex-shrink-0">
                    <Clock size={14} className="text-teal-600" />
                  </div>
                  {idx < (data.recentActivities?.length || 0) - 1 && (
                    <div className="w-px h-full bg-slate-200 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-3">
                  <p className="text-sm text-slate-700">{activity.content}</p>
                  <p className="text-xs text-slate-400 mt-0.5 font-dm">
                    {activity.timestamp ? format(new Date(activity.timestamp), 'yyyy-MM-dd HH:mm') : ''}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
