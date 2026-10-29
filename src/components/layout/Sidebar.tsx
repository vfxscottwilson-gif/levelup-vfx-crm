import React from 'react';
import {
  LayoutDashboard,
  Clock,
  CheckSquare,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Users,
  Settings,
  FolderKanban,
  KeyRound,
  BarChart3,
  LogOut,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export type NavTab =
  | 'dashboard'
  | 'time'
  | 'tasks'
  | 'projects'
  | 'hourly-reports'
  | 'daily-reports'
  | 'documents'
  | 'my-progress'
  | 'performance'
  | 'team'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { currentUser, users, switchUser, logout } = useAuth();
  const { tasks } = useData();
  const isAdmin = currentUser?.role === 'admin';

  // Count overdue or today's deadline tasks
  const today = new Date().toISOString().split('T')[0];
  const dueCount = tasks.filter(t => t.deadlineDate <= today && t.status !== 'Completed').length;

  const navItems: { id: NavTab; label: string; icon: any; adminOnly?: boolean; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'time', label: 'Clock In / Out', icon: Clock },
    { id: 'tasks', label: 'Tasks & Deadlines', icon: CheckSquare, badge: dueCount > 0 ? dueCount : undefined },
    { id: 'projects', label: 'Projects & Assignees', icon: FolderKanban },
    { id: 'hourly-reports', label: 'Hourly Reports', icon: FileSpreadsheet },
    { id: 'daily-reports', label: 'Daily Reports', icon: FileText },
    { id: 'documents', label: 'Documents & Vault', icon: KeyRound },
    { id: 'my-progress', label: 'My Progress', icon: TrendingUp },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'team', label: 'Team Accounts', icon: Users, adminOnly: true },
    { id: 'settings', label: 'Settings & Sheets', icon: Settings },
  ];

  const handleNavClick = (tab: NavTab) => {
    onTabChange(tab);
    onCloseMobile();
  };

  const getInitials = (name?: string) => {
    if (!name) return 'LU';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-[#0C111D] border-r border-slate-200 dark:border-[#222E46] flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand & Agency Header */}
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wider text-slate-900 dark:text-white uppercase block">
                LEVEL UP VFX
              </span>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold tracking-wide">
                Production CRM
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
              Menu
            </p>
            <nav className="space-y-1">
              {navItems
                .filter(item => !item.adminOnly || isAdmin)
                .map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1A2234]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
            </nav>
          </div>
        </div>

        {/* Bottom Profile & Role Switcher */}
        <div className="p-4 border-t border-slate-200 dark:border-[#222E46] bg-slate-50/50 dark:bg-[#0C111D]">
          <div className="mb-3">
            <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block px-1 mb-1">
              Active Persona
            </label>
            <select
              value={currentUser?.id}
              onChange={e => switchUser(e.target.value)}
              className="w-full bg-white dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] text-xs text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-medium"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46]">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
                {getInitials(currentUser?.name)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser?.name}</p>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-400 capitalize">
                  {currentUser?.role}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1A2234] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
