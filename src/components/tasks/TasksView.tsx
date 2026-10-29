import React, { useState, useEffect } from 'react';
import {
  Plus,
  Play,
  Pause,
  Edit2,
  Trash2,
  Search,
  Filter,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Task } from '../../types';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { TimePicker12Hour } from '../ui/TimePicker12Hour';
import { formatMinutesHuman, getTodayDateString, formatTime12Hour } from '../../utils/time';
import { downloadCsv } from '../../utils/exportCsv';

export const TasksView: React.FC = () => {
  const { currentUser, users } = useAuth();
  const {
    tasks,
    priorities,
    statuses,
    projects,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskTimer,
  } = useData();

  const isAdmin = currentUser?.role === 'admin';
  const todayStr = getTodayDateString();

  // Filters & Tabs
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'due-deadlines' | 'in-progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedProject, setSelectedProject] = useState('ALL');

  // Modal State (Admin Controller)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State (Complete Controller on Every Field)
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAssignedDate, setFormAssignedDate] = useState(todayStr);
  const [formDeadlineDate, setFormDeadlineDate] = useState(todayStr);
  const [formDeadlineTime, setFormDeadlineTime] = useState('06:00 PM');
  const [formAssigneeId, setFormAssigneeId] = useState('');
  const [formProject, setFormProject] = useState('');
  const [formPriority, setFormPriority] = useState('');
  const [formStatus, setFormStatus] = useState('');
  const [formEstimatedMinutes, setFormEstimatedMinutes] = useState(120);
  const [formTimeTakenMinutes, setFormTimeTakenMinutes] = useState(0);
  const [formProgress, setFormProgress] = useState(0);
  const [formImageAttachmentUrl, setFormImageAttachmentUrl] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Live timer tick
  const [, setTick] = useState(0);
  useEffect(() => {
    const hasActive = tasks.some(t => !!t.activeTimerStart);
    if (!hasActive) return;
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [tasks]);

  const openCreateDialog = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDescription('');
    setFormAssignedDate(todayStr);
    setFormDeadlineDate(todayStr);
    setFormDeadlineTime('06:00 PM');
    setFormAssigneeId(currentUser?.id || users[0]?.id || '');
    setFormProject(projects[0]?.name || 'Cyberpunk VFX Sequence');
    setFormPriority(priorities[0]?.label || 'Urgent');
    setFormStatus(statuses[0]?.label || 'Working');
    setFormEstimatedMinutes(120);
    setFormTimeTakenMinutes(0);
    setFormProgress(0);
    setFormImageAttachmentUrl('');
    setFormNotes('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description);
    setFormAssignedDate(task.assignedDate || todayStr);
    setFormDeadlineDate(task.deadlineDate || todayStr);
    setFormDeadlineTime(task.deadlineTime || '06:00 PM');
    setFormAssigneeId(task.assignedToId);
    setFormProject(task.project);
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormEstimatedMinutes(task.estimatedMinutes);
    setFormTimeTakenMinutes(task.timeTakenMinutes);
    setFormProgress(task.progress);
    setFormImageAttachmentUrl(task.imageAttachmentUrl || '');
    setFormNotes(task.notes);
    setIsDialogOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const assignee = users.find(u => u.id === formAssigneeId) || currentUser;

    if (editingTask) {
      updateTask({
        id: editingTask.id,
        title: formTitle.trim(),
        description: formDescription.trim(),
        assignedDate: formAssignedDate,
        deadlineDate: formDeadlineDate,
        deadlineTime: formDeadlineTime,
        assignedToId: assignee?.id || '',
        assignedToName: assignee?.name || '',
        project: formProject,
        priority: formPriority,
        status: formStatus,
        estimatedMinutes: Number(formEstimatedMinutes),
        timeTakenMinutes: Number(formTimeTakenMinutes),
        progress: Number(formProgress),
        imageAttachmentUrl: formImageAttachmentUrl.trim(),
        notes: formNotes.trim(),
      });
    } else {
      createTask({
        title: formTitle.trim(),
        description: formDescription.trim(),
        assignedDate: formAssignedDate,
        deadlineDate: formDeadlineDate,
        deadlineTime: formDeadlineTime,
        assignedToId: assignee?.id || '',
        assignedToName: assignee?.name || '',
        project: formProject,
        priority: formPriority,
        status: formStatus,
        estimatedMinutes: Number(formEstimatedMinutes),
        timeTakenMinutes: Number(formTimeTakenMinutes),
        progress: Number(formProgress),
        imageAttachmentUrl: formImageAttachmentUrl.trim(),
        notes: formNotes.trim(),
        activeTimerStart: null,
      });
    }

    setIsDialogOpen(false);
  };

  // Base list depending on role
  const userFiltered = isAdmin
    ? tasks
    : tasks.filter(t => t.assignedToId === currentUser?.id);

  // Sub-tab filtering (including the requested "Deadlines Due" tab)
  const subTabFiltered = userFiltered.filter(t => {
    if (activeSubTab === 'due-deadlines') {
      return t.deadlineDate <= todayStr && t.status !== 'Completed';
    }
    if (activeSubTab === 'in-progress') {
      return t.status !== 'Completed';
    }
    if (activeSubTab === 'completed') {
      return t.status === 'Completed';
    }
    return true;
  });

  const finalTasks = subTabFiltered.filter(t => {
    if (selectedStatus !== 'ALL' && t.status !== selectedStatus) return false;
    if (selectedPriority !== 'ALL' && t.priority !== selectedPriority) return false;
    if (selectedProject !== 'ALL' && t.project !== selectedProject) return false;
    if (
      searchQuery &&
      !t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.project.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.assignedToName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const dueCount = userFiltered.filter(t => t.deadlineDate <= todayStr && t.status !== 'Completed').length;

  const handleExportCsv = () => {
    const headers = [
      'Task ID',
      'Title',
      'Project',
      'Assignee',
      'Assigned Date',
      'Deadline Date',
      'Deadline Time (12-hr)',
      'Priority',
      'Status',
      'Estimated Mins',
      'Time Taken Mins',
      'Progress %',
      'Image Attachment',
      'Notes',
    ];
    const rows = finalTasks.map(t => [
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
    downloadCsv(`LEVEL_UP_VFX_Tasks_${todayStr}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tasks & Production Deadlines</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isAdmin ? 'Admin Portal Controller: Full access to dates, assignees, deadlines and shots' : 'Your assigned shots and delivery milestones'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#182030] hover:bg-slate-50 dark:hover:bg-[#222E46] border border-slate-200 dark:border-[#222E46] text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span>Export CSV</span>
          </button>
          {isAdmin && (
            <button
              onClick={openCreateDialog}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tabs: All, Deadlines Due, In-Progress, Completed */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#222E46] pb-2">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Tasks ({userFiltered.length})
        </button>

        {/* Dedicated "Deadlines Due" Tab requested */}
        <button
          onClick={() => setActiveSubTab('due-deadlines')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'due-deadlines'
              ? 'bg-red-500 text-white shadow-xs'
              : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Deadlines Due</span>
          {dueCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-red-600 font-bold">
              {dueCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('in-progress')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'in-progress'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          In Progress
        </button>

        <button
          onClick={() => setActiveSubTab('completed')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'completed'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search task or artist..."
            className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
        >
          <option value="ALL">All Statuses</option>
          {statuses.map(s => (
            <option key={s.id} value={s.label}>{s.label}</option>
          ))}
        </select>

        <select
          value={selectedPriority}
          onChange={e => setSelectedPriority(e.target.value)}
          className="bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
        >
          <option value="ALL">All Priorities</option>
          {priorities.map(p => (
            <option key={p.id} value={p.label}>{p.label}</option>
          ))}
        </select>

        <select
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          className="bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
        >
          <option value="ALL">All Projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {finalTasks.map(task => {
          const isTimerRunning = !!task.activeTimerStart;
          const liveTimeTaken = isTimerRunning
            ? task.timeTakenMinutes + Math.floor((Date.now() - new Date(task.activeTimerStart!).getTime()) / 60000)
            : task.timeTakenMinutes;

          const isOverdue = task.deadlineDate <= todayStr && task.status !== 'Completed';

          return (
            <div
              key={task.id}
              className={`bg-white dark:bg-[#121826] border rounded-card p-5 flex flex-col justify-between transition-all shadow-xs ${
                isOverdue
                  ? 'border-red-400 dark:border-red-500/50'
                  : isTimerRunning
                  ? 'border-blue-500 ring-1 ring-blue-500/20'
                  : 'border-slate-200 dark:border-[#222E46]'
              }`}
            >
              <div>
                {/* Header Pills */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900 truncate">
                    {task.project}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge
                      label={task.priority}
                      color={priorities.find(p => p.label === task.priority)?.color}
                    />
                    <Badge
                      label={task.status}
                      color={statuses.find(s => s.label === task.status)?.color}
                    />
                  </div>
                </div>

                {/* Optional Image Attachment Preview */}
                {task.imageAttachmentUrl && (
                  <div className="mb-3 rounded-lg overflow-hidden border border-slate-200 dark:border-[#222E46] h-32 bg-slate-100 dark:bg-[#182030] relative group">
                    <img
                      src={task.imageAttachmentUrl}
                      alt={task.title}
                      className="w-full h-full object-cover"
                    />
                    <a
                      href={task.imageAttachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs gap-1 font-semibold transition-opacity"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Full Image</span>
                    </a>
                  </div>
                )}

                {/* Title & Description */}
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 leading-snug">{task.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{task.description || 'No description provided.'}</p>

                {/* Dates & Deadlines Display */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] text-[11px] space-y-1 mb-4">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Assigned:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{task.assignedDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Deadline:</span>
                    <span className={`font-bold ${isOverdue ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'}`}>
                      {task.deadlineDate} @ {task.deadlineTime}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>Progress</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{task.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-[#182030] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>

                {/* Time & Assignee Info */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-[#222E46]">
                  <div className="flex items-center gap-1.5">
                    <Clock className={`w-3.5 h-3.5 ${isTimerRunning ? 'text-blue-500 animate-spin' : 'text-slate-400'}`} />
                    <span className={isTimerRunning ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}>
                      {formatMinutesHuman(liveTimeTaken)} / {formatMinutesHuman(task.estimatedMinutes)}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                    {task.assignedToName}
                  </span>
                </div>

                {/* Card Controls */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-[#222E46]">
                  <button
                    onClick={() => toggleTaskTimer(task.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isTimerRunning
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Stop Timer</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Timer</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <button
                        onClick={() => openEditDialog(task)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#182030] transition-colors"
                        title="Edit Everything (Admin Controller)"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-[#182030] transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADMIN CONTROLLER: Full Access Modal on Adding / Editing Task */}
      <Modal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={editingTask ? 'Admin Controller: Edit Task' : 'Admin Controller: Add New Task'}
        subtitle="Full administrative control on dates, assignees, deadlines, times, image attachments and notes"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              placeholder="e.g. Foreground clean plate & ACES color conforming"
              className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Description & Shot Deliverables
            </label>
            <textarea
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              rows={2}
              placeholder="Technical shot notes, required EXR layers, or composite passes..."
              className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Project & Assignee Control */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Project</label>
              <select
                value={formProject}
                onChange={e => setFormProject(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Assign to Artist</label>
              <select
                value={formAssigneeId}
                onChange={e => setFormAssigneeId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assigned Date & Deadline Date + 12-Hour Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46]">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Date Assigned
              </label>
              <input
                type="date"
                required
                value={formAssignedDate}
                onChange={e => setFormAssignedDate(e.target.value)}
                className="w-full bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Deadline Date
              </label>
              <input
                type="date"
                required
                value={formDeadlineDate}
                onChange={e => setFormDeadlineDate(e.target.value)}
                className="w-full bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <TimePicker12Hour
              label="Deadline Time (12-hr)"
              value={formDeadlineTime}
              onChange={setFormDeadlineTime}
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Priority</label>
              <select
                value={formPriority}
                onChange={e => setFormPriority(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                {priorities.map(p => (
                  <option key={p.id} value={p.label}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Status</label>
              <select
                value={formStatus}
                onChange={e => setFormStatus(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                {statuses.map(s => (
                  <option key={s.id} value={s.label}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Time & Progress Controller */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Estimated Time (Minutes)
              </label>
              <input
                type="number"
                min="0"
                value={formEstimatedMinutes}
                onChange={e => setFormEstimatedMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Time Already Taken (Minutes)
              </label>
              <input
                type="number"
                min="0"
                value={formTimeTakenMinutes}
                onChange={e => setFormTimeTakenMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Image Attachment URL Controller */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Image / Concept Art Attachment URL
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={formImageAttachmentUrl}
                onChange={e => setFormImageAttachmentUrl(e.target.value)}
                placeholder="https://... (or image link)"
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Progress Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Task Progress</span>
              <span className="text-blue-600 font-bold">{formProgress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={formProgress}
              onChange={e => setFormProgress(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Production Notes</label>
            <input
              type="text"
              value={formNotes}
              onChange={e => setFormNotes(e.target.value)}
              placeholder="e.g. Conform verified by Lead artist..."
              className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#222E46]">
            <button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-[#182030]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20"
            >
              {editingTask ? 'Save All Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
