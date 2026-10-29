import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  sparklineData?: number[];
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  delta,
  isPositive = true,
  icon: Icon,
  iconBgColor = 'bg-blue-50 dark:bg-blue-950/50',
  iconColor = 'text-blue-600 dark:text-blue-400',
  sparklineData = [10, 15, 12, 18, 24, 20, 28],
}) => {
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const range = max - min || 1;
  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * 64;
      const y = 24 - ((val - min) / range) * 20;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-5 relative overflow-hidden transition-all hover:border-blue-500/40 shadow-xs">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgColor}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>

        {delta && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
              isPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {delta}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">{label}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
        </div>

        <div className="w-16 h-7 opacity-75">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 64 24">
            <polyline
              fill="none"
              stroke={isPositive ? '#10B981' : '#2563EB'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
