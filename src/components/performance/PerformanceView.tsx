import React from 'react';
import {
  Trophy,
  Award,
  Zap,
  TrendingUp,
  BarChart2,
  Clock,
  CheckCircle2,
  FolderKanban,
  Target,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { AreaChart } from '../ui/AreaChart';
import { Badge } from '../ui/Badge';
import { formatMinutesHuman } from '../../utils/time';

export const PerformanceView: React.FC = () => {
  const { currentUser, users } = useAuth();
  const { tasks, hourlyReports, priorities, projects } = useData();

  const isAdmin = currentUser?.role === 'admin';
  const employees = users.filter(u => u.role === 'employee');

  // Employee-only data computation
  const userTasks = tasks.filter(t => t.assignedToId === currentUser?.id);
  const userCompletedTasks = userTasks.filter(t => t.status === 'Completed');
  const userMinutes = hourlyReports
    .filter(r => r.userId === currentUser?.id)
    .reduce((acc, curr) => acc + curr.minutesSpent, 0);
  const userHours = (userMinutes / 60).toFixed(1);
  const userCompletionRate = userTasks.length > 0 ? Math.round((userCompletedTasks.length / userTasks.length) * 100) : 100;

  // Admin company-wide leaderboard
  const leaderboard = employees.map(emp => {
    const empTasks = tasks.filter(t => t.assignedToId === emp.id);
    const completed = empTasks.filter(t => t.status === 'Completed').length;
    const empMinutes = hourlyReports
      .filter(r => r.userId === emp.id)
      .reduce((acc, curr) => acc + curr.minutesSpent, 0);

    const completionRate = empTasks.length > 0 ? Math.round((completed / empTasks.length) * 100) : 100;

    return {
      id: emp.id,
      name: emp.name,
      completedTasks: completed,
      totalHours: (empMinutes / 60).toFixed(1),
      completionRate,
      points: completed * 50 + Math.round(empMinutes / 6),
    };
  }).sort((a, b) => b.points - a.points);

  const displayTasks = isAdmin ? tasks : userTasks;
  const priorityDistribution = priorities.map(p => ({
    label: p.label,
    color: p.color,
    count: displayTasks.filter(t => t.priority === p.label).length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {isAdmin ? 'Team Performance & Analytics' : 'My Performance & Output'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isAdmin
            ? 'Production velocity, team output, and priority workload distribution'
            : 'Personal output stats, completion rate, and verified deliverables'}
        </p>
      </div>

      {/* If Employee: Isolated Personal Stats (No team data visible) */}
      {!isAdmin && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Shots</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {userCompletedTasks.length} <span className="text-xs font-normal text-slate-400">/ {userTasks.length}</span>
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                {userCompletionRate}% completion rate
              </p>
            </div>

            <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Production Hours</span>
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{userHours} hrs</p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
                Logged in verified hourly slots
              </p>
            </div>

            <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Production Velocity</span>
                <Target className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">High Efficiency</p>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
                Zero critical bottlenecks
              </p>
            </div>
          </div>

          {/* Personal Task List */}
          <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">My Assigned Tasks & Status</h3>
            <p className="text-xs text-slate-400 mb-4">Shots you are currently delivering</p>

            <div className="space-y-3">
              {userTasks.map(task => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                        {task.project}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{task.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Assigned: {task.assignedDate} • Deadline: <strong className="text-blue-500">{task.deadlineDate} @ {task.deadlineTime}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{task.progress}%</span>
                    <Badge label={task.status} color="#2563EB" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* If Admin: Complete Team Overview & Leaderboard */}
      {isAdmin && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {leaderboard.map((artist, idx) => (
              <div
                key={artist.id}
                className={`bg-white dark:bg-[#121826] border rounded-card p-5 relative overflow-hidden flex flex-col justify-between shadow-xs ${
                  idx === 0
                    ? 'border-blue-500 ring-1 ring-blue-500/20'
                    : 'border-slate-200 dark:border-[#222E46]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] flex items-center justify-center text-xs font-bold text-slate-800 dark:text-slate-200">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{artist.name}</span>
                  </div>
                  {idx === 0 && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Top Deliverer</span>
                    </div>
                  )}
                </div>

                <div className="my-4">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {artist.points} <span className="text-xs font-normal text-slate-400">pts</span>
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">
                    {artist.totalHours} hrs logged
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-[#222E46] flex items-center justify-between text-xs text-slate-400">
                  <span>Completion Rate</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{artist.completionRate}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Velocity Line Chart */}
          <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Production Effort vs Output</h3>
            <p className="text-xs text-slate-400 mb-4">Hours logged vs completed deliverables across 7 days</p>
            <AreaChart height={220} />
          </div>
        </>
      )}

      {/* Priority Load Distribution */}
      <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Task Priority Distribution</h3>
        <p className="text-xs text-slate-400 mb-6">Current workload classified by urgency levels</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {priorityDistribution.map(p => (
            <div key={p.label} className="p-4 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{p.label}</span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{p.count}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Assigned tasks</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
