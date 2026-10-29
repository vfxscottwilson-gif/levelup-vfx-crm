import React, { useState } from 'react';
import { Sidebar, NavTab } from './Sidebar';
import { Topbar } from './Topbar';

interface AppShellProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pageTitle: string;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onTabChange,
  pageTitle,
  children,
}) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070A12] p-2 sm:p-4 lg:p-6 flex flex-col justify-center transition-colors">
      <div className="w-full max-w-[1600px] mx-auto min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-3rem)] bg-white dark:bg-[#0C111D] border border-slate-200 dark:border-[#222E46] rounded-shell overflow-hidden shadow-xl dark:shadow-2xl flex flex-col transition-colors">
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onTabChange={onTabChange}
            isOpenMobile={isOpenMobile}
            onCloseMobile={() => setIsOpenMobile(false)}
          />

          {/* Main content column */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50 dark:bg-[#0C111D]">
            <Topbar
              onToggleMobileMenu={() => setIsOpenMobile(prev => !prev)}
              pageTitle={pageTitle}
            />

            {/* Scrollable View Area */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};
