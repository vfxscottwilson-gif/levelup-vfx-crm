export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  forcedPasswordChange?: boolean;
  createdAt: string;
}

export interface WorkSession {
  id: string;
  userId: string;
  userName: string;
  clockIn: string; // ISO string
  clockOut?: string | null; // ISO string
  durationMinutes?: number;
  notes?: string;
  isCorrected?: boolean;
  correctionReason?: string;
  correctedAt?: string;
  correctedBy?: string;
  status: 'active' | 'completed';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedDate: string; // YYYY-MM-DD
  deadlineDate: string; // YYYY-MM-DD
  deadlineTime: string; // 12-hour format, e.g. "06:00 PM"
  assignedToId: string;
  assignedToName: string;
  createdById: string;
  project: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low' | string;
  status: 'Working' | 'Delayed' | 'Blocked' | 'Denied' | 'Next Week' | 'Completed' | string;
  estimatedMinutes: number;
  timeTakenMinutes: number;
  progress: number; // 0 - 100
  imageAttachmentUrl?: string; // Preview image or URL
  notes: string;
  activeTimerStart?: string | null; // ISO timestamp if running
  updatedAt: string;
}

export interface HourlyReport {
  id: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  fromTime: string; // 12-hour string, e.g. "09:00 AM"
  toTime: string;   // 12-hour string, e.g. "10:30 AM"
  minutesSpent: number;
  projectId: string;
  projectName: string;
  summary: string;
  deliverables: string;
  taskProgress: 'In Progress' | 'Completed';
  expectedCompletionDeadline?: string; // Date & 12-hour time
  status: 'draft' | 'submitted' | 'approved' | 'revision_requested';
  createdAt: string;
  updatedAt: string;
}

export interface ReportComment {
  id: string;
  reportId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  createdAt: string;
}

export interface DailyReport {
  id: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  summary: string;
  blockers: string;
  tomorrowPlan: string;
  tasksCompletedIds: string[];
  totalHoursWorked: number;
  status: 'draft' | 'submitted' | 'approved' | 'revision_requested';
  managerRemarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments: ReportComment[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'API Credentials' | 'Server Access' | 'Client Portals' | 'Software Licenses' | 'Pipeline Specs';
  description: string;
  keyOrUsername: string;
  valueOrPassword: string;
  linkUrl?: string;
  isSecret: boolean;
  updatedAt: string;
}

export interface PriorityOption {
  id: string;
  label: string;
  color: string;
  order: number;
  isActive: boolean;
}

export interface StatusOption {
  id: string;
  label: string;
  color: string;
  order: number;
  isActive: boolean;
}

export interface ProjectOption {
  id: string;
  name: string;
  code: string;
  color: string;
  deadlineDate?: string;
  leadAssigneeId?: string;
  leadAssigneeName?: string;
  isActive: boolean;
}

export interface WorkdaySettings {
  workdayStartTime: string; // "09:00 AM"
  workdayEndTime: string;   // "06:00 PM"
  targetDailyHours: number; // 8
  timezone: string;         // e.g. "Asia/Karachi" or "UTC"
  googleSheetSyncUrl?: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  timestamp: string;
}
