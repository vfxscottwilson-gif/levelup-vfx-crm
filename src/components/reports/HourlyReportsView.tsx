import React, { useState, useEffect } from 'react';
import {
  Clock,
  Send,
  FileEdit,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { TimePicker12Hour } from '../ui/TimePicker12Hour';
import {
  formatTime12Hour,
  getTodayDateString,
  validateTimeRange,
  hasOverlappingReport,
  formatMinutesHuman,
} from '../../utils/time';
import { downloadCsv } from '../../utils/exportCsv';
import { HourlyReport } from '../../types';

export const HourlyReportsView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    hourlyReports,
    projects,
    saveHourlyReport,
    deleteHourlyReport,
    reviseHourlyReport,
  } = useData();

  const isAdmin = currentUser?.role === 'admin';
  const todayStr = getTodayDateString();

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fromTime, setFromTime] = useState<string>('09:00 AM');
  const [toTime, setToTime] = useState<string>('10:00 AM');
  const [minutesSpent, setMinutesSpent] = useState<number>(60);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [summary, setSummary] = useState<string>('');
  const [deliverables, setDeliverables] = useState<string>('');
  const [taskProgress, setTaskProgress] = useState<'In Progress' | 'Completed'>('In Progress');
  const [expectedCompletionDeadline, setExpectedCompletionDeadline] = useState<string>(`${todayStr} at 06:00 PM`);
  const [validationError, setValidationError] = useState<string>('');
  const [successNotice, setSuccessNotice] = useState<string>('');

  useEffect(() => {
    const range = validateTimeRange(fromTime, toTime);
    if (range.isValid) {
      setMinutesSpent(range.minutes);
      setValidationError('');
    } else {
      setValidationError(range.error || 'Invalid time interval');
    }
  }, [fromTime, toTime]);

  const userReports = hourlyReports.filter(r => {
    if (isAdmin) return r.date === todayStr;
    return r.userId === currentUser?.id && r.date === todayStr;
  });

  const handleSave = (status: 'draft' | 'submitted') => {
    setValidationError('');
    setSuccessNotice('');

    if (!summary.trim()) {
      setValidationError('Please describe what was worked on during this slot.');
      return;
    }

    const range = validateTimeRange(fromTime, toTime);
    if (!range.isValid) {
      setValidationError(range.error || 'End time must be after Start time.');
      return;
    }

    const isOverlap = hasOverlappingReport(
      fromTime,
      toTime,
      userReports.map(r => ({ fromTime: r.fromTime, toTime: r.toTime, id: r.id })),
      editingId || undefined
    );

    if (isOverlap) {
      setValidationError('The selected time range overlaps with an existing hourly report of yours.');
      return;
    }

    const project = projects.find(p => p.id === selectedProjectId) || projects[0];

    saveHourlyReport(
      {
        userId: currentUser?.id || 'unknown',
        userName: currentUser?.name || 'Unknown',
        date: todayStr,
        fromTime,
        toTime,
        minutesSpent: Number(minutesSpent),
        projectId: project?.id || '',
        projectName: project?.name || 'General Production',
        summary: summary.trim(),
        deliverables: deliverables.trim(),
        taskProgress,
        expectedCompletionDeadline: expectedCompletionDeadline.trim(),
        status,
      },
      editingId || undefined
    );

    setEditingId(null);
    setSummary('');
    setDeliverables('');
    setSuccessNotice(status === 'submitted' ? 'Hourly report submitted for supervisor review!' : 'Report saved as draft.');
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  const handleEditDraft = (report: HourlyReport) => {
    setEditingId(report.id);
    setFromTime(report.fromTime);
    setToTime(report.toTime);
    setMinutesSpent(report.minutesSpent);
    setSelectedProjectId(report.projectId);
    setSummary(report.summary);
    setDeliverables(report.deliverables);
    setTaskProgress(report.taskProgress || 'In Progress');
    setExpectedCompletionDeadline(report.expectedCompletionDeadline || `${todayStr} at 06:00 PM`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportCsv = () => {
    const headers = [
      'Report ID',
      'Employee',
      'Date',
      'From (12-hr)',
      'To (12-hr)',
      'Minutes Spent',
      'Project',
      'What was worked on',
      'Deliverables',
      'Task Progress',
      'Expected Completion Deadline',
      'Status',
    ];
    const rows = userReports.map(r => [
      r.id,
      r.userName,
      r.date,
      r.fromTime,
      r.toTime,
      r.minutesSpent,
      r.projectName,
      r.summary,
      r.deliverables,
      r.taskProgress,
      r.expectedCompletionDeadline || '',
      r.status,
    ]);
    downloadCsv(`LEVEL_UP_VFX_HourlyReports_${todayStr}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Hourly Work Reporting</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Log precise 12-hour work intervals, task completion status, and delivery milestones
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#182030] hover:bg-slate-50 dark:hover:bg-[#222E46] border border-slate-200 dark:border-[#222E46] text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-blue-500" />
          <span>Export Today's CSV</span>
        </button>
      </div>

      {/* Main Single Card with Live 12-Hour Clock */}
      <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#222E46]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Hourly Report Draft' : 'Log Hourly Time Slot'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">12-hour AM/PM times with overlap validation</p>
            </div>
          </div>

          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900">
            {todayStr}
          </span>
        </div>

        {validationError && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {successNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <TimePicker12Hour
            label="From Time (12-hr AM/PM)"
            value={fromTime}
            onChange={setFromTime}
          />
          <TimePicker12Hour
            label="To Time (12-hr AM/PM)"
            value={toTime}
            onChange={setToTime}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Duration (Minutes)
            </label>
            <input
              type="number"
              min="5"
              step="5"
              value={minutesSpent}
              onChange={e => setMinutesSpent(Number(e.target.value))}
              className="bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Project & Task Progress Selector (Requested) */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1.5">
              Target VFX Project
            </label>
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1.5">
              Task Status for this Slot
            </label>
            <select
              value={taskProgress}
              onChange={e => setTaskProgress(e.target.value as 'In Progress' | 'Completed')}
              className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="In Progress">Under Working / In Progress</option>
              <option value="Completed">Completed / Delivered</option>
            </select>
          </div>
        </div>

        {/* What was worked on during this slot (Requested) */}
        <div className="mt-4">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1.5">
            What was worked on during this slot? <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={summary}
            onChange={e => setSummary(e.target.value)}
            placeholder="e.g. Completed optical motion blur splines for frame 120-180 and checked alpha edge"
            className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Specific Completion Deadline (Requested) */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1.5">
              Specific Target Deadline for Task (Date & 12-hr Time)
            </label>
            <input
              type="text"
              value={expectedCompletionDeadline}
              onChange={e => setExpectedCompletionDeadline(e.target.value)}
              placeholder="e.g. 2026-10-31 at 05:00 PM"
              className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1.5">
              Deliverable / Cache / Output Link
            </label>
            <input
              type="text"
              value={deliverables}
              onChange={e => setDeliverables(e.target.value)}
              placeholder="e.g. //nas/vfx/renders/shot02_v04.exr"
              className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#222E46] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Calculated: <strong className="text-blue-600 dark:text-blue-400">{formatMinutesHuman(minutesSpent)}</strong> interval
          </div>

          <div className="flex items-center gap-3">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setSummary('');
                  setDeliverables('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-[#182030]"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSave('draft')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#182030] hover:bg-slate-200 dark:hover:bg-[#222E46] border border-slate-200 dark:border-[#222E46] text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave('submitted')}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Approval</span>
            </button>
          </div>
        </div>
      </div>

      {/* Today's Logged Slots Table */}
      <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Today's Logged Intervals</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Time slots submitted for {todayStr}</p>
          </div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-900">
            {userReports.length} Slots Logged
          </span>
        </div>

        {userReports.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No hourly reports logged yet today. Use the form above to record your work chunk.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#222E46] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Time Slot (12-hr)</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Project</th>
                  <th className="pb-3">Work Accomplished</th>
                  <th className="pb-3">Task Progress</th>
                  <th className="pb-3">Target Deadline</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:border-[#222E46] text-xs">
                {userReports.map(report => (
                  <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-[#182030]/50 transition-colors">
                    <td className="py-3 font-semibold text-blue-600 dark:text-blue-400">
                      {report.fromTime} - {report.toTime}
                    </td>
                    <td className="py-3 text-slate-800 dark:text-slate-200 font-medium">
                      {formatMinutesHuman(report.minutesSpent)}
                    </td>
                    <td className="py-3 text-slate-800 dark:text-slate-200 font-medium">{report.projectName}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">{report.summary}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        report.taskProgress === 'Completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                      }`}>
                        {report.taskProgress || 'In Progress'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {report.expectedCompletionDeadline || '--'}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          report.status === 'approved'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : report.status === 'submitted'
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {report.status === 'draft' && (
                          <button
                            onClick={() => handleEditDraft(report)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#182030]"
                            title="Edit Draft"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {report.status !== 'draft' && (
                          <button
                            onClick={() => reviseHourlyReport(report.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-[#182030]"
                            title="Revise Report"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteHourlyReport(report.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-[#182030]"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
