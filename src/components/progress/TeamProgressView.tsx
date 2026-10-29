import React, { useState } from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatMinutesHuman, getTodayDateString, parse12HourToMinutes } from '../../utils/time';
import { downloadCsv } from '../../utils/exportCsv';

export const TeamProgressView: React.FC = () => {
  const { users } = useAuth();
  const { tasks, sessions, hourlyReports, dailyReports, workdaySettings } = useData();

  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('ALL');
  const employees = users.filter(u => u.role === 'employee');

  const shiftStartMins = parse12HourToMinutes(workdaySettings.workdayStartTime);

  // Compute team metrics per employee
  const teamStats = employees.map(emp => {
    const empTasks = tasks.filter(t => t.assignedToId === emp.id);
    const empDoneTasks = empTasks.filter(t => t.status === 'Completed').length;
    const empBlockedTasks = empTasks.filter(t => t.status === 'Blocked' || t.status === 'Delayed').length;

    const empHourly = hourlyReports.filter(r => r.userId === emp.id);
    const totalMinutes = empHourly.reduce((acc, curr) => acc + curr.minutesSpent, 0);

    const empSessions = sessions.filter(s => s.userId === emp.id);
    let lateCount = 0;
    empSessions.forEach(s => {
      const inDate = new Date(s.clockIn);
      const sessionMins = inDate.getHours() * 60 + inDate.getMinutes();
      if (sessionMins > shiftStartMins + 15) lateCount++;
    });

    const dailyCount = dailyReports.filter(r => r.userId === emp.id).length;

    return {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      hoursLogged: (totalMinutes / 60).toFixed(1),
      tasksDone: empDoneTasks,
      tasksTotal: empTasks.length,
      blockedTasks: empBlockedTasks,
      lateCheckIns: lateCount,
      reportsSubmitted: dailyCount,
    };
  });

  const filteredStats = teamStats.filter(s => {
    if (selectedUserFilter !== 'ALL' && s.id !== selectedUserFilter) return false;
    return true;
  });

  const handleExportCsv = () => {
    const headers = ['Employee', 'Email', 'Hours Logged', 'Tasks Completed', 'Total Tasks', 'Blocked Tasks', 'Late Check-ins', 'Daily Reports Submitted'];
    const rows = filteredStats.map(s => [
      s.name,
      s.email,
      s.hoursLogged,
      s.tasksDone,
      s.tasksTotal,
      s.blockedTasks,
      s.lateCheckIns,
      s.reportsSubmitted,
    ]);
    downloadCsv(`LevelOfVFX_TeamProgress_${getTodayDateString()}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#EAEEF7]">Team Production Progress</h2>
          <p className="text-xs text-[#8B94A9]">
            Supervisor overview of artists, hours delivered, and workflow bottlenecks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedUserFilter}
            onChange={e => setSelectedUserFilter(e.target.value)}
            className="bg-[#1A1E28] border border-[#242A38] rounded-xl px-3 py-2 text-xs text-[#EAEEF7] focus:outline-none focus:border-[#3B82F6]"
          >
            <option value="ALL">All Artists</option>
            {employees.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1A1E28] hover:bg-[#242A38] border border-[#242A38] text-xs font-semibold text-[#EAEEF7] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Table Card */}
      <div className="bg-[#14171F] border border-[#242A38] rounded-card p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#242A38] text-[11px] font-semibold text-[#8B94A9] uppercase tracking-wider">
                <th className="pb-3">Artist</th>
                <th className="pb-3">Hours Logged</th>
                <th className="pb-3">Tasks Completed</th>
                <th className="pb-3">Blocked / Delayed</th>
                <th className="pb-3">Late Check-Ins</th>
                <th className="pb-3">Reports Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242A38] text-xs">
              {filteredStats.map(stat => (
                <tr key={stat.id} className="hover:bg-[#1A1E28]/40 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#1A1E28] border border-[#3B82F6]/30 flex items-center justify-center font-bold text-xs text-[#38BDF8]">
                        {stat.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#EAEEF7]">{stat.name}</p>
                        <p className="text-[10px] text-[#8B94A9]">{stat.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-bold text-[#38BDF8]">{stat.hoursLogged} hrs</td>
                  <td className="py-4">
                    <span className="font-semibold text-[#22C55E]">{stat.tasksDone}</span>
                    <span className="text-[#8B94A9]"> / {stat.tasksTotal}</span>
                  </td>
                  <td className="py-4">
                    {stat.blockedTasks > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
                        {stat.blockedTasks} Blocked
                      </span>
                    ) : (
                      <span className="text-[#8B94A9]">None</span>
                    )}
                  </td>
                  <td className="py-4">
                    {stat.lateCheckIns > 0 ? (
                      <span className="text-[#F59E0B] font-semibold">{stat.lateCheckIns} Days</span>
                    ) : (
                      <span className="text-[#22C55E]">On-time</span>
                    )}
                  </td>
                  <td className="py-4 font-semibold text-[#EAEEF7]">{stat.reportsSubmitted} Daily</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
