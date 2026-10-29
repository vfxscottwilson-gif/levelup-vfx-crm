import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { format } from 'date-fns';

interface TopbarProps {
  onToggleMobileMenu: () => void;
  pageTitle: string;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileMenu, pageTitle }) => {
  const { currentUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(format(now, 'hh:mm:ss a - EEE, MMM dd'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
    <header className="h-16 border-b border-slate-200 dark:border-[#222E46] bg-white/95 dark:bg-[#0C111D]/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left: Mobile menu & breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1A2234]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-400">
            <span className="font-bold text-slate-700 dark:text-slate-300">LEVEL UP VFX</span>
            <span>/</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">{pageTitle}</span>
          </div>
        </div>
      </div>

      {/* Middle: Live 12-Hour Clock & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md mx-4">
        <div className="relative w-full hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks, shots, documents..."
            className="w-full bg-slate-100 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>{currentTimeStr || '12:00:00 PM'}</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Light / Dark Mode Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl p-1">
          <button
            onClick={() => setTheme('light')}
            title="Light theme"
            className={`p-1.5 rounded-lg transition-colors ${
              theme === 'light' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            title="Dark theme"
            className={`p-1.5 rounded-lg transition-colors ${
              theme === 'dark' ? 'bg-[#121826] text-blue-400 shadow-xs font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1A2234] transition-colors border border-transparent"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card shadow-xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#222E46]">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Notifications
                </h4>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                  Updates
                </span>
              </div>
              <div className="mt-3 space-y-2.5 max-h-64 overflow-y-auto">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">Hourly slot approved</p>
                    <p className="text-[11px] text-slate-400">09:00 AM - 11:00 AM verified by supervisor</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">Upcoming Deadline</p>
                    <p className="text-[11px] text-slate-400">Houdini smoke explosion due tomorrow</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-[#222E46]">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
            {getInitials(currentUser?.name)}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{currentUser?.name}</p>
            <p className="text-[10px] text-slate-400 capitalize mt-0.5">{currentUser?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
