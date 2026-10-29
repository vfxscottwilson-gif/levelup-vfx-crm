import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  ArrowUpRight,
  TrendingUp,
  FolderKanban,
  Calendar,
} from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { AreaChart } from '../ui/AreaChart';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatMinutesHuman, formatTime12Hour, getTodayDateString } from '../../utils/time';

export const DashboardView: React.FC<{ onNavigate: (tab: any) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { tasks, sessions, hourlyReports, dailyReports, priorities, statuses } = useData();
  const todayStr = getTodayDateString();

  // Metrics
  const activeSessionsCount = sessions.filter(s => s.status === 'active' && !s.clockOut).length;
  const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;
  const pendingApprovalsCount = dailyReports.filter(d => d.status === 'submitted').length +
    hourlyReports.filter(h => h.status === 'submitted').length;

  const totalMinutesLoggedToday = hourlyReports.reduce((acc, curr) => acc + (curr.minutesSpent || 0), 0);
  const totalHoursLogged = (totalMinutesLoggedToday / 60).toFixed(1);

  // Status breakdown
  const statusCounts = statuses.map(s => ({
    label: s.label,
    color: s.color,
    count: tasks.filter(t => t.status === s.label).length,
  }));
  const totalTasks = tasks.length || 1;
  const completedPercentage = Math.round((completedTasksCount / totalTasks) * 100);

  // Overdue count
  const overdueCount = tasks.filter(t => t.deadlineDate <= todayStr && t.status !== 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              LEVEL UP VFX
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
              Studio Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Production Management, Attendance & Artist Pipeline Delivery
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('time')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all"
          >
            <Clock className="w-4 h-4" />
            <span>Clock In / Out</span>
          </button>
          <button
            onClick={() => onNavigate('projects')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#182030] hover:bg-slate-200 dark:hover:bg-[#222E46] border border-slate-200 dark:border-[#222E46] text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
          >
            <FolderKanban className="w-4 h-4 text-blue-500" />
            <span>View Projects</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Hours Logged Today"
          value={`${totalHoursLogged} hrs`}
          delta="+12% velocity"
          isPositive={true}
          icon={Clock}
          iconBgColor="bg-blue-50 dark:bg-blue-950/50"
          iconColor="text-blue-600 dark:text-blue-400"
          sparklineData={[4, 5, 6, 7, 6.5, 8, totalMinutesLoggedToday / 60]}
        />
        <StatCard
          label="Tasks Delivered"
          value={`${completedTasksCount} / ${tasks.length}`}
          delta={`${completedPercentage}% done`}
          isPositive={true}
          icon={CheckCircle2}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/50"
          iconColor="text-emerald-600 dark:text-emerald-400"
          sparklineData={[2, 3, 4, 3, 5, 4, completedTasksCount]}
        />
        <StatCard
          label="Deadlines Due"
          value={overdueCount}
          delta={overdueCount > 0 ? 'Requires Focus' : 'On Schedule'}
          isPositive={overdueCount === 0}
          icon={Calendar}
          iconBgColor="bg-amber-50 dark:bg-amber-950/50"
          iconColor="text-amber-600 dark:text-amber-400"
          sparklineData={[1, 2, 2, 3, 2, 1, overdueCount]}
        />
        <StatCard
          label="Active Artists"
          value={activeSessionsCount}
          delta={activeSessionsCount > 0 ? 'Live in Studio' : 'Idle'}
          isPositive={activeSessionsCount > 0}
          icon={Users}
          iconBgColor="bg-purple-50 dark:bg-purple-950/50"
          iconColor="text-purple-600 dark:text-purple-400"
          sparklineData={[1, 2, 2, 3, 2, 3, activeSessionsCount]}
        />
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large 2-Series Area Chart (Hours vs Tasks Completed) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-6 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Studio Output & Hours</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Weekly comparison of production hours and completed deliveries</p>
            </div>
            <button
              onClick={() => onNavigate('performance')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Full Analytics →
            </button>
          </div>
          <AreaChart height={220} />
        </div>

        {/* Donut Card: Task Status Breakdown */}
        <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-6 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Production Delivery</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Shot completion rate across all active projects</p>
          </div>

          <div className="my-6 flex flex-col items-center justify-center relative">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#E2E8F0"
                  className="dark:stroke-[#182030]"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#2563EB"
                  strokeWidth="8"
                  strokeDasharray={`${(completedPercentage * 251.2) / 100} 251.2`}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{completedPercentage}%</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Complete</span>
              </div>
            </div>
          </div>

          {/* Status Breakdown Pills */}
          <div className="grid grid-cols-2 gap-2">
            {statusCounts.slice(0, 4).map(sc => (
              <div key={sc.label} className="bg-slate-50 dark:bg-[#182030] rounded-xl p-2.5 border border-slate-200 dark:border-[#222E46] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sc.color }} />
                  <span className="text-xs text-slate-600 dark:text-slate-400 truncate font-medium">{sc.label}</span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{sc.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Active Tasks Table & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tasks Table Card */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Production Tasks</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live VFX shots with assigned dates and 12-hour deadlines</p>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-[#182030] hover:bg-slate-200 dark:hover:bg-[#222E46] border border-slate-200 dark:border-[#222E46] text-blue-600 dark:text-blue-400"
            >
              View All Tasks
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#222E46] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Task & Project</th>
                  <th className="pb-3">Assignee</th>
                  <th className="pb-3">Deadline</th>
                  <th className="pb-3">Progress</th>
                  <th className="pb-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#222E46] text-xs">
                {tasks.slice(0, 4).map(task => (
                  <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-[#182030]/50 transition-colors">
                    <td className="py-3 pr-3">
                      <p className="font-bold text-slate-900 dark:text-white truncate max-w-xs">{task.title}</p>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{task.project}</span>
                    </td>
                    <td className="py-3 text-slate-800 dark:text-slate-200 font-medium">
                      {task.assignedToName}
                    </td>
                    <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">
                      {task.deadlineDate} @ {task.deadlineTime}
                    </td>
                    <td className="py-3">
                      <div className="w-24">
                        <div className="flex items-center justify-between text-[10px] mb-1 text-slate-500 dark:text-slate-400">
                          <span>{task.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-[#182030] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400 font-medium">
                      {formatMinutesHuman(task.timeTakenMinutes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity & Remarks Card */}
        <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Supervisor Feed</h3>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          <div className="space-y-3.5">
            {dailyReports.flatMap(r => r.comments).slice(0, 3).map((c, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{c.authorName}</span>
                  <span className="text-[10px] text-slate-400">{formatTime12Hour(c.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300">{c.text}</p>
              </div>
            ))}

            {sessions.slice(0, 2).map((s, idx) => (
              <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/50 dark:bg-[#182030]/40 border border-slate-200 dark:border-[#222E46]">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-900 dark:text-white">
                    <span className="font-bold">{s.userName}</span> clocked in
                  </p>
                  <p className="text-[10px] text-slate-400">{formatTime12Hour(s.clockIn)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
