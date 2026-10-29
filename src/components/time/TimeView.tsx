import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Square,
  AlertTriangle,
  Download,
  Calendar,
  CheckCircle,
  FileEdit,
  History,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Modal } from '../ui/Modal';
import { TimePicker12Hour } from '../ui/TimePicker12Hour';
import {
  formatTime12Hour,
  formatElapsedSeconds,
  formatMinutesHuman,
  getTodayDateString,
  parse12HourToMinutes,
} from '../../utils/time';
import { downloadCsv } from '../../utils/exportCsv';
import { WorkSession } from '../../types';

export const TimeView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    sessions,
    activeSession,
    clockIn,
    clockOut,
    correctSession,
    workdaySettings,
  } = useData();

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [clockInNotes, setClockInNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Correction Modal State
  const [correctionTarget, setCorrectionTarget] = useState<WorkSession | null>(null);
  const [correctionFromTime, setCorrectionFromTime] = useState<string>('09:00 AM');
  const [correctionToTime, setCorrectionToTime] = useState<string>('06:00 PM');
  const [correctionReason, setCorrectionReason] = useState<string>('');
  const [showConfirmStep, setShowConfirmStep] = useState<boolean>(false);

  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0);
      return;
    }

    const startTimestamp = new Date(activeSession.clockIn).getTime();
    const updateElapsed = () => {
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((now - startTimestamp) / 1000));
      setElapsedSeconds(diffSecs);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const isForgotToClockOut = activeSession && elapsedSeconds > 50400;

  const handleClockIn = () => {
    setErrorMessage('');
    const res = clockIn(clockInNotes);
    if (!res.success) {
      setErrorMessage(res.error || 'Clock in failed');
    } else {
      setClockInNotes('');
    }
  };

  const handleClockOut = () => {
    setErrorMessage('');
    const res = clockOut();
    if (!res.success) {
      setErrorMessage(res.error || 'Clock out failed');
    }
  };

  const openCorrectionModal = (session: WorkSession) => {
    setCorrectionTarget(session);
    setCorrectionFromTime(formatTime12Hour(session.clockIn));
    setCorrectionToTime(session.clockOut ? formatTime12Hour(session.clockOut) : '06:00 PM');
    setCorrectionReason('');
    setShowConfirmStep(false);
  };

  const handleSaveCorrection = () => {
    if (!correctionTarget || !correctionReason.trim()) return;

    const dateStr = correctionTarget.clockIn.split('T')[0];
    const fromMins = parse12HourToMinutes(correctionFromTime);
    const toMins = parse12HourToMinutes(correctionToTime);

    if (toMins <= fromMins) {
      alert('End time must be after Start time.');
      return;
    }

    const inDate = new Date(`${dateStr}T00:00:00Z`);
    inDate.setUTCMinutes(fromMins);

    const outDate = new Date(`${dateStr}T00:00:00Z`);
    outDate.setUTCMinutes(toMins);

    correctSession(
      correctionTarget.id,
      inDate.toISOString(),
      outDate.toISOString(),
      correctionReason.trim()
    );
    setCorrectionTarget(null);
  };

  const handleExportCsv = () => {
    const userSessions = currentUser?.role === 'admin'
      ? sessions
      : sessions.filter(s => s.userId === currentUser?.id);

    const headers = ['Session ID', 'Employee', 'Date', 'Clock In', 'Clock Out', 'Duration', 'Status', 'Corrected', 'Correction Reason'];
    const rows = userSessions.map(s => [
      s.id,
      s.userName,
      s.clockIn.split('T')[0],
      formatTime12Hour(s.clockIn),
      s.clockOut ? formatTime12Hour(s.clockOut) : 'Active',
      s.durationMinutes ? formatMinutesHuman(s.durationMinutes) : '--',
      s.status,
      s.isCorrected ? 'YES' : 'NO',
      s.correctionReason || '',
    ]);

    downloadCsv(`LEVEL_UP_VFX_Sessions_${getTodayDateString()}`, headers, rows);
  };

  const filteredSessions = currentUser?.role === 'admin'
    ? sessions
    : sessions.filter(s => s.userId === currentUser?.id);

  return (
    <div className="space-y-6">
      {/* Forgot-to-clock-out Warning Banner */}
      {isForgotToClockOut && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-red-600 dark:text-red-400">Forgot to clock out warning!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your session has been running for over 14 hours. Please clock out or correct your hours.
              </p>
            </div>
          </div>
          <button
            onClick={() => activeSession && openCorrectionModal(activeSession)}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
          >
            Correct Time Shortcut
          </button>
        </div>
      )}

      {/* Main Clock In / Out Action Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Attendance & Production Timer</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  12-hour precision tracking • Survives page reloads
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  activeSession
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-[#182030] text-slate-500 border-slate-200 dark:border-[#222E46]'
                }`}
              >
                {activeSession ? '● Clocked In (Active)' : '○ Clocked Out'}
              </span>
            </div>

            {/* Timer Display */}
            <div className="my-8 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Shift Elapsed Time
              </span>
              <div className="text-5xl sm:text-6xl font-black font-mono tracking-wider text-slate-900 dark:text-white">
                {formatElapsedSeconds(elapsedSeconds)}
              </div>
              {activeSession && (
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Clocked In at {formatTime12Hour(activeSession.clockIn)}</span>
                </div>
              )}
            </div>

            {errorMessage && (
              <p className="text-xs text-red-500 mb-4 text-center font-semibold">{errorMessage}</p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {!activeSession ? (
                <div className="w-full flex items-center gap-3">
                  <input
                    type="text"
                    value={clockInNotes}
                    onChange={e => setClockInNotes(e.target.value)}
                    placeholder="Optional note (e.g. Starting roto shot 14)..."
                    className="flex-1 bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleClockIn}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all shrink-0"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Clock In</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleClockOut}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm shadow-red-500/20 transition-all"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Clock Out</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Shift Policy Card */}
        <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-6 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Studio Schedule</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Target timings configured for LEVEL UP VFX</p>

            <div className="mt-5 space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Shift Start</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{workdaySettings.workdayStartTime}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Shift End</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{workdaySettings.workdayEndTime}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Daily Target</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{workdaySettings.targetDailyHours} Hours</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Timezone</span>
                <span className="text-xs font-medium text-slate-900 dark:text-white">{workdaySettings.timezone}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-[#222E46]">
            <p className="text-[11px] text-slate-400 italic">
              Clock-ins after {workdaySettings.workdayStartTime} are logged as late arrivals in production insights.
            </p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Sessions History</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentUser?.role === 'admin' ? 'All team member sessions' : 'Your personal session log'}
            </p>
          </div>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#182030] hover:bg-slate-200 dark:hover:bg-[#222E46] border border-slate-200 dark:border-[#222E46] text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#222E46] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Employee</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Clock In (12-hr)</th>
                <th className="pb-3">Clock Out (12-hr)</th>
                <th className="pb-3">Total Time</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#222E46] text-xs">
              {filteredSessions.map(session => (
                <tr key={session.id} className="hover:bg-slate-50 dark:hover:bg-[#182030]/50 transition-colors">
                  <td className="py-3 font-bold text-slate-900 dark:text-white">{session.userName}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{session.clockIn.split('T')[0]}</td>
                  <td className="py-3 text-blue-600 dark:text-blue-400 font-semibold">{formatTime12Hour(session.clockIn)}</td>
                  <td className="py-3 text-slate-900 dark:text-white font-medium">
                    {session.clockOut ? formatTime12Hour(session.clockOut) : (
                      <span className="text-emerald-500 font-bold">Active Now</span>
                    )}
                  </td>
                  <td className="py-3 text-slate-900 dark:text-white font-bold">
                    {session.durationMinutes ? formatMinutesHuman(session.durationMinutes) : '--'}
                  </td>
                  <td className="py-3">
                    {session.isCorrected ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        Corrected
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        Verified
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => openCorrectionModal(session)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-[#182030] hover:bg-slate-200 dark:hover:bg-[#222E46] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#222E46] transition-colors"
                    >
                      Correct Time
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Time Correction Modal */}
      <Modal
        isOpen={!!correctionTarget}
        onClose={() => setCorrectionTarget(null)}
        title="Time Correction with Audit Record"
        subtitle="Specify revised 12-hour start/end times and mandatory reason"
      >
        {!showConfirmStep ? (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] text-xs space-y-1">
              <p className="text-slate-500 dark:text-slate-400">Target Artist: <strong className="text-slate-900 dark:text-white">{correctionTarget?.userName}</strong></p>
              <p className="text-slate-500 dark:text-slate-400">Date: <strong className="text-slate-900 dark:text-white">{correctionTarget?.clockIn.split('T')[0]}</strong></p>
              <p className="text-slate-500 dark:text-slate-400">Original Clock In: <strong className="text-blue-600 dark:text-blue-400">{formatTime12Hour(correctionTarget?.clockIn)}</strong></p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TimePicker12Hour
                label="Corrected Clock In (12-hr)"
                value={correctionFromTime}
                onChange={setCorrectionFromTime}
              />
              <TimePicker12Hour
                label="Corrected Clock Out (12-hr)"
                value={correctionToTime}
                onChange={setCorrectionToTime}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Reason for Correction <span className="text-red-500">*</span>
              </label>
              <textarea
                value={correctionReason}
                onChange={e => setCorrectionReason(e.target.value)}
                placeholder="e.g. Forgot to clock out before client screening at 6:00 PM..."
                rows={3}
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#222E46]">
              <button
                type="button"
                onClick={() => setCorrectionTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-[#182030]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!correctionReason.trim()}
                onClick={() => setShowConfirmStep(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold"
              >
                Review & Confirm
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-slate-900 dark:text-white space-y-2">
              <p className="font-bold text-amber-600 dark:text-amber-400">Audit Trail Confirmation</p>
              <p>Revising session timings to <strong>{correctionFromTime} - {correctionToTime}</strong>.</p>
              <p className="text-slate-500 dark:text-slate-400">Reason: "{correctionReason}"</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">An immutable audit log entry will be saved with your name.</p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#222E46]">
              <button
                type="button"
                onClick={() => setShowConfirmStep(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-[#182030]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSaveCorrection}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                Save Correction
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
