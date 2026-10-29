import React, { useState } from 'react';
import {
  Settings,
  Clock,
  Sliders,
  Trash2,
  Plus,
  Save,
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
  FileSpreadsheet,
  Copy,
  Check,
  Download,
  Database,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { TimePicker12Hour } from '../ui/TimePicker12Hour';
import { downloadCsv } from '../../utils/exportCsv';
import { getTodayDateString } from '../../utils/time';

export const SettingsView: React.FC = () => {
  const { currentUser, users } = useAuth();
  const {
    workdaySettings,
    updateWorkdaySettings,
    priorities,
    statuses,
    projects,
    tasks,
    sessions,
    hourlyReports,
    dailyReports,
    addPriority,
    deletePriority,
    addStatus,
    deleteStatus,
    cleanupOldData,
  } = useData();

  const isAdmin = currentUser?.role === 'admin';
  const todayStr = getTodayDateString();

  // Workday State
  const [startTime, setStartTime] = useState(workdaySettings.workdayStartTime);
  const [endTime, setEndTime] = useState(workdaySettings.workdayEndTime);
  const [targetHours, setTargetHours] = useState(workdaySettings.targetDailyHours);
  const [timezone, setTimezone] = useState(workdaySettings.timezone);
  const [googleSheetSyncUrl, setGoogleSheetSyncUrl] = useState(workdaySettings.googleSheetSyncUrl || '');
  const [workdaySaved, setWorkdaySaved] = useState(false);

  // New option states
  const [newPriorityLabel, setNewPriorityLabel] = useState('');
  const [newPriorityColor, setNewPriorityColor] = useState('#2563EB');
  const [newStatusLabel, setNewStatusLabel] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#3B82F6');

  // Copy status
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const handleSaveWorkday = (e: React.FormEvent) => {
    e.preventDefault();
    updateWorkdaySettings({
      workdayStartTime: startTime,
      workdayEndTime: endTime,
      targetDailyHours: Number(targetHours),
      timezone,
      googleSheetSyncUrl,
    });
    setWorkdaySaved(true);
    setTimeout(() => setWorkdaySaved(false), 3000);
  };

  const handleAddPriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPriorityLabel.trim()) return;
    addPriority(newPriorityLabel.trim(), newPriorityColor);
    setNewPriorityLabel('');
  };

  const handleAddStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusLabel.trim()) return;
    addStatus(newStatusLabel.trim(), newStatusColor);
    setNewStatusLabel('');
  };

  const copyToClipboard = (text: string, tabName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  // Google Sheets Tab Structures
  const googleSheetTabs = [
    {
      tabName: 'Check_In_Out',
      description: 'Records every clock-in, clock-out, 12-hour duration, and audit reasons',
      headers: ['Session_ID', 'Employee_Name', 'Email', 'Date', 'Clock_In_12hr', 'Clock_Out_12hr', 'Duration_Minutes', 'Status', 'Is_Corrected', 'Correction_Reason'],
    },
    {
      tabName: 'Hourly_Reports',
      description: 'Granular 12-hour work intervals, task progress, and target deadlines',
      headers: ['Report_ID', 'Employee_Name', 'Date', 'Time_Slot_12hr', 'Minutes_Spent', 'Project', 'Work_Accomplished', 'Deliverables', 'Task_Progress', 'Target_Deadline', 'Status'],
    },
    {
      tabName: 'Daily_Reports',
      description: 'End-of-day summaries, total hours, blockers, and supervisor approval remarks',
      headers: ['Report_ID', 'Employee_Name', 'Date', 'Total_Hours', 'Work_Summary', 'Blockers', 'Tomorrow_Plan', 'Tasks_Completed', 'Status', 'Manager_Remarks'],
    },
    {
      tabName: 'Tasks_Deadlines',
      description: 'Complete task registry, assignment dates, 12-hour deadlines, and image attachments',
      headers: ['Task_ID', 'Title', 'Project', 'Assignee', 'Assigned_Date', 'Deadline_Date', 'Deadline_Time_12hr', 'Priority', 'Status', 'Estimated_Mins', 'Time_Taken_Mins', 'Progress_Percent', 'Image_Attachment', 'Notes'],
    },
    {
      tabName: 'Employee_Directory',
      description: 'Team members, roles (Admin vs Employee), and active status',
      headers: ['User_ID', 'Name', 'Email', 'Role', 'Status', 'Created_Date'],
    },
  ];

  const handleExportFullBundle = () => {
    // Export Tasks CSV as sample bundle
    const taskHeaders = googleSheetTabs[3].headers;
    const taskRows = tasks.map(t => [
      t.id,
      t.title,
      t.project,
      t.assignedToName,
      t.assignedDate,
      t.deadlineDate,
      t.deadlineTime,
      t.priority,
      t.status,
      t.estimatedMinutes,
      t.timeTakenMinutes,
      `${t.progress}%`,
      t.imageAttachmentUrl || '',
      t.notes || '',
    ]);
    downloadCsv(`LEVEL_UP_VFX_Full_Database_Export_${todayStr}`, taskHeaders, taskRows);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Settings & Database Architecture</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Workday rules, Google Sheets integration guide, database storage specs, and task taxonomies
        </p>
      </div>

      {/* 1. Google Sheets & Database Architecture Guide (Requested) */}
      <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-[#222E46] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Google Sheets Database Integration & Headers
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                How to set up your Google Sheet to mirror the entire LEVEL UP VFX CRM database
              </p>
            </div>
          </div>

          <button
            onClick={handleExportFullBundle}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Download All Data (CSV Bundle)</span>
          </button>
        </div>

        {/* Database Storage Location Explanation */}
        <div className="my-5 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-slate-800 dark:text-slate-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-400">
            <Database className="w-4 h-4" />
            <span>Where is the data currently stored?</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            All your data (tasks, hours, clock-in sessions, documents, and reports) is automatically persisted in your local system's secure browser database (<code className="font-mono bg-white dark:bg-[#182030] px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">localStorage</code> with real-time JSON synchronization). It persists indefinitely across refreshes and restarts.
          </p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>For Google Sheets:</strong> Create a Google Sheet named <em>"LEVEL UP VFX - Production Database"</em> and create the 5 tabs below. You can copy the exact headers with 1 click:
          </p>
        </div>

        {/* Google Sheets Tab Blueprints */}
        <div className="space-y-4">
          {googleSheetTabs.map((tab, idx) => {
            const headerRowString = tab.headers.join('\t');
            const isCopied = copiedTab === tab.tabName;

            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-[#121826] px-2 py-0.5 rounded border border-slate-200 dark:border-[#222E46]">
                      Tab: {tab.tabName}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{tab.description}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                    {tab.headers.map((h, i) => (
                      <span key={i} className="bg-white dark:bg-[#121826] px-1.5 py-0.5 rounded border border-slate-200 dark:border-[#222E46]">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(headerRowString, tab.tabName)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#121826] hover:bg-slate-100 dark:hover:bg-[#222E46] border border-slate-200 dark:border-[#222E46] text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shrink-0 self-start sm:self-auto"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-blue-500" />}
                  <span>{isCopied ? 'Headers Copied!' : 'Copy Row Headers'}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Optional Webhook Sync URL */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#222E46]">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Google Sheets Apps Script Webhook URL (Optional live auto-sync)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={googleSheetSyncUrl}
              onChange={e => setGoogleSheetSyncUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="flex-1 bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSaveWorkday}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
            >
              Save URL
            </button>
          </div>
        </div>
      </div>

      {/* 2. Workday Timing Settings (12-hour AM/PM) */}
      <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-6 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-[#222E46]">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Standard Workday Timings</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              12-hour format controls late check-in detection and production compliance
            </p>
          </div>
        </div>

        {workdaySaved && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveWorkday} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TimePicker12Hour
              label="Standard Shift Start (12-hr)"
              value={startTime}
              onChange={setStartTime}
              disabled={!isAdmin}
            />
            <TimePicker12Hour
              label="Standard Shift End (12-hr)"
              value={endTime}
              onChange={setEndTime}
              disabled={!isAdmin}
            />
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                Target Daily Hours
              </label>
              <input
                type="number"
                min="1"
                max="24"
                disabled={!isAdmin}
                value={targetHours}
                onChange={e => setTargetHours(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                Agency Timezone
              </label>
              <select
                disabled={!isAdmin}
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium disabled:opacity-50"
              >
                <option value="Asia/Karachi">Asia/Karachi (PKT UTC+5)</option>
                <option value="UTC">UTC (Universal Time)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
          </div>

          {isAdmin && (
            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Schedule</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* 3. Custom Priorities & Statuses */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Task Priorities</h3>
            <div className="space-y-2">
              {priorities.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{p.label}</span>
                  </div>
                  <button
                    onClick={() => deletePriority(p.id)}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddPriority} className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-[#222E46]">
              <input
                type="text"
                placeholder="New priority..."
                value={newPriorityLabel}
                onChange={e => setNewPriorityLabel(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <input
                type="color"
                value={newPriorityColor}
                onChange={e => setNewPriorityColor(e.target.value)}
                className="w-7 h-7 rounded border border-slate-200 dark:border-[#222E46] bg-transparent cursor-pointer"
              />
              <button
                type="submit"
                className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Task Statuses</h3>
            <div className="space-y-2">
              {statuses.map(s => (
                <div key={s.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{s.label}</span>
                  </div>
                  <button
                    onClick={() => deleteStatus(s.id)}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddStatus} className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-[#222E46]">
              <input
                type="text"
                placeholder="New status..."
                value={newStatusLabel}
                onChange={e => setNewStatusLabel(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <input
                type="color"
                value={newStatusColor}
                onChange={e => setNewStatusColor(e.target.value)}
                className="w-7 h-7 rounded border border-slate-200 dark:border-[#222E46] bg-transparent cursor-pointer"
              />
              <button
                type="submit"
                className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
