import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  BarChart2,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  formatTime12Hour,
  getTodayDateString,
  formatMinutesHuman,
  parse12HourToMinutes,
} from '../../utils/time';

export const MyProgressView: React.FC = () => {
  const { currentUser } = useAuth();
  const { tasks, sessions, hourlyReports, workdaySettings } = useData();

  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const todayStr = getTodayDateString();

  const userTasks = tasks.filter(t => t.assignedToId === currentUser?.id);
  const userSessions = sessions.filter(s => s.userId === currentUser?.id);
  const userHourly = hourlyReports.filter(r => r.userId === currentUser?.id);

  const userTodayTasks = userTasks.filter(t => t.assignedDate === todayStr);
  const doneTodayTasks = userTodayTasks.filter(t => t.status === 'Completed').length;
  const totalTodayTasks = userTodayTasks.length || 1;
  const taskDonePercentage = Math.round((doneTodayTasks / totalTodayTasks) * 100);

  const todayMinutesLogged = userHourly
    .filter(r => r.date === todayStr)
    .reduce((acc, curr) => acc + curr.minutesSpent, 0);
  const todayHoursLogged = (todayMinutesLogged / 60).toFixed(1);
  const targetDailyHours = workdaySettings.targetDailyHours || 8;
  const hoursProgressPercentage = Math.min(100, Math.round(((todayMinutesLogged / 60) / targetDailyHours) * 100));

  const todaySession = userSessions.find(s => s.clockIn.startsWith(todayStr));
  const checkInDisplay = todaySession ? formatTime12Hour(todaySession.clockIn) : '--:-- --';
  const checkOutDisplay = todaySession?.clockOut ? formatTime12Hour(todaySession.clockOut) : (todaySession ? 'In Progress' : '--:-- --');

  const shiftStartMins = parse12HourToMinutes(workdaySettings.workdayStartTime);
  let lateCheckInsCount = 0;
  let totalCheckInMins = 0;
  let validSessionsCount = 0;

  userSessions.forEach(s => {
    const inDate = new Date(s.clockIn);
    const sessionMins = inDate.getHours() * 60 + inDate.getMinutes();
    totalCheckInMins += sessionMins;
    validSessionsCount++;
    if (sessionMins > shiftStartMins + 15) {
      lateCheckInsCount++;
    }
  });

  const avgCheckInMinutes = validSessionsCount > 0 ? Math.round(totalCheckInMins / validSessionsCount) : shiftStartMins;
  const avgHours = Math.floor(avgCheckInMinutes / 60);
  const avgMins = avgCheckInMinutes % 60;
  const avgPeriod = avgHours >= 12 ? 'PM' : 'AM';
  const avgCheckInTimeStr = `${String(avgHours % 12 || 12).padStart(2, '0')}:${String(avgMins).padStart(2, '0')} ${avgPeriod}`;

  return (
    <div className="space-y-6">
      {/* View Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Production Progress</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Attendance consistency, daily delivery rings, and verified hours
          </p>
        </div>

        <div className="flex items-center bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] p-1 rounded-xl self-start sm:self-auto shadow-xs">
          {(['daily', 'weekly', 'monthly'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Insights Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Check-In Time</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">{avgCheckInTimeStr}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Late Arrivals</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{lateCheckInsCount} Days</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Shift Compliance</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">96.8%</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tab 1: DAILY */}
      {activeTab === 'daily' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-6 flex flex-col items-center justify-center text-center shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Today's Deliveries</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Completed shots & pipeline assets</p>

            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" className="dark:stroke-[#182030]" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth="8"
                  strokeDasharray={`${(taskDonePercentage * 251.2) / 100} 251.2`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{doneTodayTasks} / {totalTodayTasks}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Done</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-6 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400">{doneTodayTasks} Finished</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-[#182030]" />
                <span className="text-slate-600 dark:text-slate-400">{totalTodayTasks - doneTodayTasks} In Flight</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-6 flex flex-col justify-between shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Timing & Target</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Standard target: {targetDailyHours} Hours Daily</p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Check-in Time</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{checkInDisplay}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Check-out Time</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{checkOutDisplay}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Hours Logged in Slots</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{todayHoursLogged} hrs</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#222E46]">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span>Daily Target Fulfillment</span>
                <span className="font-bold text-slate-900 dark:text-white">{hoursProgressPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#182030] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${hoursProgressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: WEEKLY */}
      {activeTab === 'weekly' && (
        <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Mon - Sun Weekly Breakdown</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Production hours and shots delivered per day</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              On Schedule
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4">
            {[
              { day: 'Mon', hours: 8.0, tasks: 3 },
              { day: 'Tue', hours: 8.5, tasks: 4 },
              { day: 'Wed', hours: 7.2, tasks: 2 },
              { day: 'Thu', hours: 8.0, tasks: 5 },
              { day: 'Fri', hours: 7.5, tasks: 3 },
              { day: 'Sat', hours: 4.0, tasks: 1 },
              { day: 'Sun', hours: 0.0, tasks: 0 },
            ].map((d, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className="w-full bg-slate-100 dark:bg-[#182030] rounded-xl h-36 flex flex-col justify-end p-1.5 relative group">
                  <div
                    className="w-full bg-blue-600 rounded-lg transition-all"
                    style={{ height: `${(d.hours / 9) * 100}%` }}
                  />
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] pointer-events-none transition-opacity">
                    {d.hours}h
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{d.day}</span>
                <span className="text-[10px] text-slate-400">{d.tasks} tasks</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: MONTHLY */}
      {activeTab === 'monthly' && (
        <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Monthly Activity Calendar Grid</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Production days worked and average shift metrics</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">162.5 Total Hours</span>
              <p className="text-[11px] text-slate-400">Avg 7.9 hrs/day</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-4">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((h, i) => (
              <div key={i} className="text-center text-xs font-bold text-slate-400 pb-1">
                {h}
              </div>
            ))}
            {Array.from({ length: 31 }, (_, i) => {
              const dayNum = i + 1;
              const isWeekend = (dayNum % 7 === 6 || dayNum % 7 === 0);
              const worked = !isWeekend && dayNum <= 29;
              return (
                <div
                  key={i}
                  className={`h-12 rounded-xl p-1.5 flex flex-col justify-between border transition-all ${
                    worked
                      ? 'bg-blue-50/50 dark:bg-[#182030] border-blue-200 dark:border-blue-900'
                      : 'bg-slate-50 dark:bg-[#121826]/40 border-slate-200 dark:border-[#222E46]/40 opacity-50'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{dayNum}</span>
                  {worked && (
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 self-end">8h</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
