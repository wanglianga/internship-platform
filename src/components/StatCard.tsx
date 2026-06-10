import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  gradient?: string;
  delay?: number;
}

export default function StatCard({ title, value, icon, trend, trendUp, gradient = 'stat-card-gradient-1', delay = 0 }: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl p-5 text-white shadow-lg ${gradient} animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-6 translate-x-6" />
      <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white/5 translate-y-4 -translate-x-4" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm text-white/80 mb-1 font-medium">{title}</p>
          <p className="text-3xl font-bold font-dm">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trendUp ? 'text-white/90' : 'text-white/90'}`}>
              {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
          {icon}
        </div>
      </div>
      <div className="absolute inset-0 animate-shimmer pointer-events-none rounded-xl" />
    </div>
  );
}
