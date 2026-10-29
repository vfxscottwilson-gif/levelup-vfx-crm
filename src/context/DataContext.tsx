import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  WorkSession,
  Task,
  HourlyReport,
  DailyReport,
  PriorityOption,
  StatusOption,
  ProjectOption,
  WorkdaySettings,
  AuditLogItem,
  DocumentItem,
  User,
} from '../types';
import {
  INITIAL_SESSIONS,
  INITIAL_TASKS,
  INITIAL_HOURLY_REPORTS,
  INITIAL_DAILY_REPORTS,
  INITIAL_PRIORITIES,
  INITIAL_STATUSES,
  INITIAL_PROJECTS,
  INITIAL_WORKDAY,
  INITIAL_DOCUMENTS,
} from '../utils/initialData';
import { useAuth } from './AuthContext';
import { getTodayDateString } from '../utils/time';

interface DataContextType {
  sessions: WorkSession[];
  tasks: Task[];
  hourlyReports: HourlyReport[];
  dailyReports: DailyReport[];
  priorities: PriorityOption[];
  statuses: StatusOption[];
  projects: ProjectOption[];
  documents: DocumentItem[];
  workdaySettings: WorkdaySettings;
  auditLogs: AuditLogItem[];

  // Time tracking methods
  activeSession: WorkSession | undefined;
  clockIn: (notes?: string) => { success: boolean; error?: string };
  clockOut: (notes?: string) => { success: boolean; error?: string };
  correctSession: (sessionId: string, newClockIn: string, newClockOut: string, reason: string) => void;

  // Task methods
  createTask: (task: Omit<Task, 'id' | 'updatedAt' | 'createdById'>) => void;
  updateTask: (task: Partial<Task> & { id: string }) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskTimer: (taskId: string) => void;

  // Hourly Report methods
  saveHourlyReport: (report: Omit<HourlyReport, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => { success: boolean; error?: string };
  deleteHourlyReport: (reportId: string) => void;
  reviseHourlyReport: (reportId: string) => void;

  // Daily Report methods
  saveDailyReport: (report: Omit<DailyReport, 'id' | 'createdAt' | 'updatedAt' | 'comments'>, id?: string) => void;
  reviewDailyReport: (reportId: string, status: 'approved' | 'revision_requested', remarks?: string) => void;
  addReportComment: (reportId: string, text: string) => void;

  // Document Vault methods
  createDocument: (doc: Omit<DocumentItem, 'id' | 'updatedAt'>) => void;
  updateDocument: (doc: Partial<DocumentItem> & { id: string }) => void;
  deleteDocument: (docId: string) => void;

  // Settings & Project methods
  updateWorkdaySettings: (settings: Partial<WorkdaySettings>) => void;
  addPriority: (label: string, color: string) => void;
  updatePriority: (id: string, updates: Partial<PriorityOption>) => void;
  deletePriority: (id: string) => void;
  addStatus: (label: string, color: string) => void;
  updateStatus: (id: string, updates: Partial<StatusOption>) => void;
  deleteStatus: (id: string) => void;
  addProject: (name: string, code: string, color: string, deadlineDate?: string, leadAssigneeId?: string, leadAssigneeName?: string) => void;
  updateProject: (id: string, updates: Partial<ProjectOption>) => void;
  deleteProject: (id: string) => void;

  // Cleanup tool
  cleanupOldData: (monthsAgo: number, types: string[]) => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // Load from LocalStorage or Fallback
  const [sessions, setSessions] = useState<WorkSession[]>(() => {
    const saved = localStorage.getItem('teamlog_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('teamlog_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [hourlyReports, setHourlyReports] = useState<HourlyReport[]>(() => {
    const saved = localStorage.getItem('teamlog_hourly_reports');
    return saved ? JSON.parse(saved) : INITIAL_HOURLY_REPORTS;
  });

  const [dailyReports, setDailyReports] = useState<DailyReport[]>(() => {
    const saved = localStorage.getItem('teamlog_daily_reports');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_REPORTS;
  });

  const [priorities, setPriorities] = useState<PriorityOption[]>(() => {
    const saved = localStorage.getItem('teamlog_priorities');
    return saved ? JSON.parse(saved) : INITIAL_PRIORITIES;
  });

  const [statuses, setStatuses] = useState<StatusOption[]>(() => {
    const saved = localStorage.getItem('teamlog_statuses');
    return saved ? JSON.parse(saved) : INITIAL_STATUSES;
  });

  const [projects, setProjects] = useState<ProjectOption[]>(() => {
    const saved = localStorage.getItem('teamlog_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('teamlog_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [workdaySettings, setWorkdaySettings] = useState<WorkdaySettings>(() => {
    const saved = localStorage.getItem('teamlog_workday');
    return saved ? JSON.parse(saved) : INITIAL_WORKDAY;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem('teamlog_audit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence Sync
  useEffect(() => { localStorage.setItem('teamlog_sessions', JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem('teamlog_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('teamlog_hourly_reports', JSON.stringify(hourlyReports)); }, [hourlyReports]);
  useEffect(() => { localStorage.setItem('teamlog_daily_reports', JSON.stringify(dailyReports)); }, [dailyReports]);
  useEffect(() => { localStorage.setItem('teamlog_priorities', JSON.stringify(priorities)); }, [priorities]);
  useEffect(() => { localStorage.setItem('teamlog_statuses', JSON.stringify(statuses)); }, [statuses]);
  useEffect(() => { localStorage.setItem('teamlog_projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('teamlog_documents', JSON.stringify(documents)); }, [documents]);
  useEffect(() => { localStorage.setItem('teamlog_workday', JSON.stringify(workdaySettings)); }, [workdaySettings]);
  useEffect(() => { localStorage.setItem('teamlog_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);

  // Current active session for current user
  const activeSession = currentUser
    ? sessions.find(s => s.userId === currentUser.id && s.status === 'active' && !s.clockOut)
    : undefined;

  // --- TIME TRACKING ---
  const clockIn = (notes?: string) => {
    if (!currentUser) return { success: false, error: 'User not authenticated.' };
    if (activeSession) return { success: false, error: 'You are already clocked in.' };

    const newSession: WorkSession = {
      id: `sess-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      clockIn: new Date().toISOString(),
      clockOut: null,
      notes: notes || '',
      status: 'active',
    };

    setSessions(prev => [newSession, ...prev]);
    return { success: true };
  };

  const clockOut = (notes?: string) => {
    if (!currentUser) return { success: false, error: 'User not authenticated.' };
    if (!activeSession) return { success: false, error: 'No active session to clock out from.' };

    const now = new Date();
    const clockInTime = new Date(activeSession.clockIn);
    const durationMinutes = Math.max(1, Math.round((now.getTime() - clockInTime.getTime()) / 60000));

    setSessions(prev =>
      prev.map(s =>
        s.id === activeSession.id
          ? {
              ...s,
              clockOut: now.toISOString(),
              durationMinutes,
              notes: notes || s.notes,
              status: 'completed',
            }
          : s
      )
    );
    return { success: true };
  };

  const correctSession = (sessionId: string, newClockIn: string, newClockOut: string, reason: string) => {
    const inTime = new Date(newClockIn);
    const outTime = new Date(newClockOut);
    const durationMinutes = Math.max(1, Math.round((outTime.getTime() - inTime.getTime()) / 60000));

    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? {
              ...s,
              clockIn: newClockIn,
              clockOut: newClockOut,
              durationMinutes,
              isCorrected: true,
              correctionReason: reason,
              correctedAt: new Date().toISOString(),
              correctedBy: currentUser?.name || 'Admin',
            }
          : s
      )
    );

    setAuditLogs(prev => [
      {
        id: `audit-${Date.now()}`,
        action: 'TIME_CORRECTION',
        details: `Session ${sessionId} corrected. Reason: ${reason}`,
        performedBy: currentUser?.name || 'Admin',
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  // --- TASKS (Full Admin Controller) ---
  const createTask = (taskData: Omit<Task, 'id' | 'updatedAt' | 'createdById'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdById: currentUser?.id || 'admin',
      updatedAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (updates: Partial<Task> & { id: string }) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === updates.id
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const toggleTaskTimer = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          if (t.activeTimerStart) {
            const elapsed = Math.round((Date.now() - new Date(t.activeTimerStart).getTime()) / 60000);
            return {
              ...t,
              activeTimerStart: null,
              timeTakenMinutes: (t.timeTakenMinutes || 0) + Math.max(1, elapsed),
              updatedAt: new Date().toISOString(),
            };
          } else {
            return {
              ...t,
              activeTimerStart: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
        }
        return t;
      })
    );
  };

  // --- HOURLY REPORTS ---
  const saveHourlyReport = (
    reportData: Omit<HourlyReport, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string
  ) => {
    if (id) {
      setHourlyReports(prev =>
        prev.map(r =>
          r.id === id
            ? { ...r, ...reportData, updatedAt: new Date().toISOString() }
            : r
        )
      );
    } else {
      const newReport: HourlyReport = {
        ...reportData,
        id: `hr-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setHourlyReports(prev => [newReport, ...prev]);
    }
    return { success: true };
  };

  const deleteHourlyReport = (reportId: string) => {
    setHourlyReports(prev => prev.filter(r => r.id !== reportId));
  };

  const reviseHourlyReport = (reportId: string) => {
    setHourlyReports(prev =>
      prev.map(r => (r.id === reportId ? { ...r, status: 'draft' } : r))
    );
  };

  // --- DAILY REPORTS ---
  const saveDailyReport = (
    reportData: Omit<DailyReport, 'id' | 'createdAt' | 'updatedAt' | 'comments'>,
    id?: string
  ) => {
    if (id) {
      setDailyReports(prev =>
        prev.map(r =>
          r.id === id
            ? { ...r, ...reportData, updatedAt: new Date().toISOString() }
            : r
        )
      );
    } else {
      const newReport: DailyReport = {
        ...reportData,
        id: `dr-${Date.now()}`,
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setDailyReports(prev => [newReport, ...prev]);
    }
  };

  const reviewDailyReport = (
    reportId: string,
    status: 'approved' | 'revision_requested',
    remarks?: string
  ) => {
    setDailyReports(prev =>
      prev.map(r =>
        r.id === reportId
          ? {
              ...r,
              status,
              managerRemarks: remarks || r.managerRemarks,
              reviewedBy: currentUser?.name || 'Admin',
              reviewedAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const addReportComment = (reportId: string, text: string) => {
    if (!currentUser || !text.trim()) return;
    const newComment = {
      id: `c-${Date.now()}`,
      reportId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setDailyReports(prev =>
      prev.map(r =>
        r.id === reportId
          ? { ...r, comments: [...(r.comments || []), newComment] }
          : r
      )
    );
  };

  // --- DOCUMENT VAULT ---
  const createDocument = (doc: Omit<DocumentItem, 'id' | 'updatedAt'>) => {
    const newDoc: DocumentItem = {
      ...doc,
      id: `doc-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setDocuments(prev => [newDoc, ...prev]);
  };

  const updateDocument = (updates: Partial<DocumentItem> & { id: string }) => {
    setDocuments(prev =>
      prev.map(d =>
        d.id === updates.id
          ? { ...d, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
          : d
      )
    );
  };

  const deleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  // --- SETTINGS & PROJECTS ---
  const updateWorkdaySettings = (newSettings: Partial<WorkdaySettings>) => {
    setWorkdaySettings(prev => ({ ...prev, ...newSettings }));
  };

  const addPriority = (label: string, color: string) => {
    const newOption: PriorityOption = {
      id: `p-${Date.now()}`,
      label,
      color,
      order: priorities.length + 1,
      isActive: true,
    };
    setPriorities(prev => [...prev, newOption]);
  };

  const updatePriority = (id: string, updates: Partial<PriorityOption>) => {
    setPriorities(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePriority = (id: string) => {
    setPriorities(prev => prev.filter(p => p.id !== id));
  };

  const addStatus = (label: string, color: string) => {
    const newOption: StatusOption = {
      id: `s-${Date.now()}`,
      label,
      color,
      order: statuses.length + 1,
      isActive: true,
    };
    setStatuses(prev => [...prev, newOption]);
  };

  const updateStatus = (id: string, updates: Partial<StatusOption>) => {
    setStatuses(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteStatus = (id: string) => {
    setStatuses(prev => prev.filter(s => s.id !== id));
  };

  const addProject = (
    name: string,
    code: string,
    color: string,
    deadlineDate?: string,
    leadAssigneeId?: string,
    leadAssigneeName?: string
  ) => {
    const newOption: ProjectOption = {
      id: `proj-${Date.now()}`,
      name,
      code,
      color,
      deadlineDate: deadlineDate || '2026-11-15',
      leadAssigneeId,
      leadAssigneeName,
      isActive: true,
    };
    setProjects(prev => [...prev, newOption]);
  };

  const updateProject = (id: string, updates: Partial<ProjectOption>) => {
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const cleanupOldData = (monthsAgo: number, types: string[]): number => {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsAgo);
    let deletedCount = 0;

    if (types.includes('hourly')) {
      const remaining = hourlyReports.filter(r => new Date(r.createdAt) > cutoffDate || r.status !== 'approved');
      deletedCount += (hourlyReports.length - remaining.length);
      setHourlyReports(remaining);
    }

    if (types.includes('daily')) {
      const remaining = dailyReports.filter(r => new Date(r.createdAt) > cutoffDate || r.status !== 'approved');
      deletedCount += (dailyReports.length - remaining.length);
      setDailyReports(remaining);
    }

    if (types.includes('tasks')) {
      const remaining = tasks.filter(t => new Date(t.updatedAt) > cutoffDate || t.status !== 'Completed');
      deletedCount += (tasks.length - remaining.length);
      setTasks(remaining);
    }

    return deletedCount;
  };

  return (
    <DataContext.Provider
      value={{
        sessions,
        tasks,
        hourlyReports,
        dailyReports,
        priorities,
        statuses,
        projects,
        documents,
        workdaySettings,
        auditLogs,
        activeSession,
        clockIn,
        clockOut,
        correctSession,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskTimer,
        saveHourlyReport,
        deleteHourlyReport,
        reviseHourlyReport,
        saveDailyReport,
        reviewDailyReport,
        addReportComment,
        createDocument,
        updateDocument,
        deleteDocument,
        updateWorkdaySettings,
        addPriority,
        updatePriority,
        deletePriority,
        addStatus,
        updateStatus,
        deleteStatus,
        addProject,
        updateProject,
        deleteProject,
        cleanupOldData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
