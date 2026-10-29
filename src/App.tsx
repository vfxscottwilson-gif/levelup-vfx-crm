import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AppShell } from './components/layout/AppShell';
import { NavTab } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { TimeView } from './components/time/TimeView';
import { TasksView } from './components/tasks/TasksView';
import { ProjectsView } from './components/projects/ProjectsView';
import { HourlyReportsView } from './components/reports/HourlyReportsView';
import { DailyReportsView } from './components/reports/DailyReportsView';
import { DocumentsView } from './components/documents/DocumentsView';
import { MyProgressView } from './components/progress/MyProgressView';
import { PerformanceView } from './components/performance/PerformanceView';
import { TeamManagementView } from './components/team/TeamManagementView';
import { SettingsView } from './components/settings/SettingsView';
import { Layers, ArrowRight, ShieldCheck } from 'lucide-react';

const MainRouter: React.FC = () => {
  const { currentUser, login, users } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Clean, Minimal Login Screen (LEVEL UP VFX branding, Blue theme, No emojis)
  if (!currentUser) {
    const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError('');
      const success = login(loginEmail);
      if (!success) {
        setLoginError('Invalid credentials. Check user email or use direct sign-in below.');
      }
    };

    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#070A12] flex flex-col items-center justify-center p-4 transition-colors">
        <div className="w-full max-w-md bg-white dark:bg-[#0C111D] border border-slate-200 dark:border-[#222E46] rounded-shell p-8 shadow-xl">
          {/* Logo & Title */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/25 mb-3">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-wider uppercase">
              LEVEL UP VFX
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Production Management & Team Portal</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 text-center font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Company Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="name@levelupvfx.com"
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/25 transition-all"
            >
              <span>Sign In to LEVEL UP VFX</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Direct Sign In */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-[#222E46]">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center mb-3">
              One-Click Direct Sign In
            </p>
            <div className="space-y-2">
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => login(u.email)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#121826] hover:bg-slate-100 dark:hover:bg-[#182030] border border-slate-200 dark:border-[#222E46] transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[11px] font-bold text-blue-600 dark:text-blue-400">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{u.name}</p>
                      <p className="text-[10px] text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getTabTitle = (tab: NavTab): string => {
    switch (tab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'time': return 'Clock In / Out & Sessions';
      case 'tasks': return 'Tasks & Deadlines';
      case 'projects': return 'Projects & Lead Assignees';
      case 'hourly-reports': return 'Hourly Reports';
      case 'daily-reports': return 'Daily Reports & Supervisor Review';
      case 'documents': return 'Documentation & Secure Vault';
      case 'my-progress': return 'My Personal Progress';
      case 'performance': return 'Performance & Velocity';
      case 'team': return 'Team Management';
      case 'settings': return 'Settings & Database Architecture';
    }
  };

  return (
    <AppShell
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      pageTitle={getTabTitle(currentTab)}
    >
      {currentTab === 'dashboard' && <DashboardView onNavigate={setCurrentTab} />}
      {currentTab === 'time' && <TimeView />}
      {currentTab === 'tasks' && <TasksView />}
      {currentTab === 'projects' && <ProjectsView />}
      {currentTab === 'hourly-reports' && <HourlyReportsView />}
      {currentTab === 'daily-reports' && <DailyReportsView />}
      {currentTab === 'documents' && <DocumentsView />}
      {currentTab === 'my-progress' && <MyProgressView />}
      {currentTab === 'performance' && <PerformanceView />}
      {currentTab === 'team' && <TeamManagementView />}
      {currentTab === 'settings' && <SettingsView />}
    </AppShell>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <MainRouter />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
