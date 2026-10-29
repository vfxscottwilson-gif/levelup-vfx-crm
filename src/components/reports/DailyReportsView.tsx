import React, { useState } from 'react';
import {
  FileText,
  Send,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { getTodayDateString, formatTime12Hour } from '../../utils/time';
import { DailyReport } from '../../types';

export const DailyReportsView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    dailyReports,
    saveDailyReport,
    reviewDailyReport,
    addReportComment,
    tasks,
    hourlyReports,
  } = useData();

  const isAdmin = currentUser?.role === 'admin';
  const todayStr = getTodayDateString();

  const existingReport = dailyReports.find(
    r => r.userId === currentUser?.id && r.date === todayStr
  );

  const [summary, setSummary] = useState(existingReport?.summary || '');
  const [blockers, setBlockers] = useState(existingReport?.blockers || '');
  const [tomorrowPlan, setTomorrowPlan] = useState(existingReport?.tomorrowPlan || '');

  const [reviewStatusFilter, setReviewStatusFilter] = useState<'ALL' | 'submitted' | 'approved' | 'revision_requested'>('ALL');
  const [activeCommentReportId, setActiveCommentReportId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [remarksInput, setRemarksInput] = useState<{ [reportId: string]: string }>({});

  const userTodayHourlyMinutes = hourlyReports
    .filter(r => r.userId === currentUser?.id && r.date === todayStr)
    .reduce((acc, curr) => acc + curr.minutesSpent, 0);
  const calculatedHoursWorked = (userTodayHourlyMinutes / 60).toFixed(1);

  const completedTodayTasks = tasks.filter(
    t => t.assignedToId === currentUser?.id && t.status === 'Completed'
  );

  const handleSubmitDaily = (status: 'draft' | 'submitted') => {
    if (!summary.trim()) {
      alert('Please fill out the summary of work done today.');
      return;
    }

    saveDailyReport(
      {
        userId: currentUser?.id || 'unknown',
        userName: currentUser?.name || 'Unknown',
        date: todayStr,
        summary: summary.trim(),
        blockers: blockers.trim(),
        tomorrowPlan: tomorrowPlan.trim(),
        tasksCompletedIds: completedTodayTasks.map(t => t.id),
        totalHoursWorked: parseFloat(calculatedHoursWorked) || 8,
        status,
        managerRemarks: existingReport?.managerRemarks || '',
      },
      existingReport?.id
    );

    alert(status === 'submitted' ? 'Daily report submitted to Supervisor!' : 'Daily report saved as draft.');
  };

  const handleApprove = (reportId: string) => {
    const remark = remarksInput[reportId] || 'Approved by production supervisor.';
    reviewDailyReport(reportId, 'approved', remark);
  };

  const handleRequestChanges = (reportId: string) => {
    const remark = remarksInput[reportId];
    if (!remark || !remark.trim()) {
      alert('Please enter remarks explaining what needs revision.');
      return;
    }
    reviewDailyReport(reportId, 'revision_requested', remark);
  };

  const handlePostComment = (reportId: string) => {
    if (!commentText.trim()) return;
    addReportComment(reportId, commentText);
    setCommentText('');
  };

  const queueReports = dailyReports.filter(r => {
    if (reviewStatusFilter !== 'ALL' && r.status !== reviewStatusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* EOD Form */}
      <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-[#222E46] gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">End-of-Day (EOD) Daily Report</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Daily synthesis of delivered shots and next-day production plans</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] text-blue-600 dark:text-blue-400 self-start sm:self-auto">
            Report Date: {todayStr}
          </span>
        </div>

        <div className="my-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Calculated Time from Hourly Logs:</span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{calculatedHoursWorked} Hours</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Completed Shots Today:</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{completedTodayTasks.length} Completed</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Summary of Work Accomplished Today <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Overview of shots comped, 3D assets textured, simulation caches baked..."
              className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Blockers, Delays, or Technical Bottlenecks (Optional)
            </label>
            <input
              type="text"
              value={blockers}
              onChange={e => setBlockers(e.target.value)}
              placeholder="e.g. Waiting for tracking camera solve from supervisor..."
              className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Plan for Tomorrow
            </label>
            <input
              type="text"
              value={tomorrowPlan}
              onChange={e => setTomorrowPlan(e.target.value)}
              placeholder="e.g. Integrate pyro sim pass into final composite shot 14 and render review MOV..."
              className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {existingReport?.managerRemarks && (
          <div className="mt-4 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs">
            <span className="font-bold text-blue-600 dark:text-blue-400">Supervisor Remarks:</span>
            <p className="mt-1 text-slate-800 dark:text-slate-200">{existingReport.managerRemarks}</p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#222E46] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => handleSubmitDaily('draft')}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#182030] hover:bg-slate-200 dark:hover:bg-[#222E46] border border-slate-200 dark:border-[#222E46] text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmitDaily('submitted')}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Daily Report</span>
          </button>
        </div>
      </div>

      {/* Review Queue */}
      <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-[#222E46]">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Supervisor Review Queue</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Review, approve, or request revisions on team daily reports</p>
          </div>

          <div className="flex items-center gap-2">
            {(['ALL', 'submitted', 'approved', 'revision_requested'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setReviewStatusFilter(tab)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  reviewStatusFilter === tab
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-[#182030] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {queueReports.map(report => (
            <div
              key={report.id}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60 dark:border-[#222E46]/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                    {report.userName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{report.userName}</h4>
                    <p className="text-[11px] text-slate-400">{report.date} • {report.totalHoursWorked} hrs logged</p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase self-start sm:self-auto ${
                    report.status === 'approved'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : report.status === 'submitted'
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {report.status.replace('_', ' ')}
                </span>
              </div>

              <div className="text-xs space-y-2">
                <p className="text-slate-800 dark:text-slate-200"><strong className="text-slate-500 dark:text-slate-400">Summary:</strong> {report.summary}</p>
                {report.blockers && (
                  <p className="text-amber-600 dark:text-amber-400"><strong className="text-slate-500 dark:text-slate-400">Blockers:</strong> {report.blockers}</p>
                )}
                {report.tomorrowPlan && (
                  <p className="text-blue-600 dark:text-blue-400"><strong className="text-slate-500 dark:text-slate-400">Tomorrow:</strong> {report.tomorrowPlan}</p>
                )}
              </div>

              {report.managerRemarks && (
                <div className="p-3 rounded-xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] text-xs">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Manager Remarks:</span>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5">{report.managerRemarks}</p>
                </div>
              )}

              {isAdmin && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-slate-200/60 dark:border-[#222E46]/60">
                  <input
                    type="text"
                    value={remarksInput[report.id] || ''}
                    onChange={e => setRemarksInput({ ...remarksInput, [report.id]: e.target.value })}
                    placeholder="Add supervisor remark or revision guidance..."
                    className="flex-1 bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRequestChanges(report.id)}
                      className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-semibold transition-colors"
                    >
                      Request Changes
                    </button>
                    <button
                      onClick={() => handleApprove(report.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      Approve Report
                    </button>
                  </div>
                </div>
              )}

              {/* Comments Thread */}
              <div className="pt-2">
                <button
                  onClick={() => setActiveCommentReportId(activeCommentReportId === report.id ? null : report.id)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-semibold"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                  <span>Comments ({report.comments?.length || 0})</span>
                </button>

                {activeCommentReportId === report.id && (
                  <div className="mt-3 space-y-3 pt-3 border-t border-slate-200 dark:border-[#222E46]">
                    {report.comments?.map(c => (
                      <div key={c.id} className="p-2.5 rounded-xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-blue-600 dark:text-blue-400">{c.authorName}</span>
                          <span className="text-[10px] text-slate-400">{formatTime12Hour(c.createdAt)}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">{c.text}</p>
                      </div>
                    ))}

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        placeholder="Write a message to artist..."
                        className="flex-1 bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => handlePostComment(report.id)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
