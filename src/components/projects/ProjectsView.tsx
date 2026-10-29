import React, { useState } from 'react';
import {
  FolderKanban,
  Calendar,
  Users,
  AlertTriangle,
  Clock,
  Plus,
  CheckCircle2,
  Trash2,
  Edit2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { formatMinutesHuman, getTodayDateString } from '../../utils/time';

export const ProjectsView: React.FC = () => {
  const { currentUser, users } = useAuth();
  const { projects, tasks, addProject, updateProject, deleteProject } = useData();

  const isAdmin = currentUser?.role === 'admin';
  const todayStr = getTodayDateString();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState('#2563EB');
  const [deadlineDate, setDeadlineDate] = useState('2026-11-15');
  const [leadAssigneeId, setLeadAssigneeId] = useState('');

  const openCreateModal = () => {
    setEditingProjectId(null);
    setName('');
    setCode('');
    setColor('#2563EB');
    setDeadlineDate('2026-11-15');
    setLeadAssigneeId(users[0]?.id || '');
    setIsModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProjectId(p.id);
    setName(p.name);
    setCode(p.code);
    setColor(p.color);
    setDeadlineDate(p.deadlineDate || '2026-11-15');
    setLeadAssigneeId(p.leadAssigneeId || users[0]?.id || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const lead = users.find(u => u.id === leadAssigneeId);

    if (editingProjectId) {
      updateProject(editingProjectId, {
        name: name.trim(),
        code: code.trim() || 'VFX',
        color,
        deadlineDate,
        leadAssigneeId,
        leadAssigneeName: lead?.name || 'Unassigned',
      });
    } else {
      addProject(
        name.trim(),
        code.trim() || 'VFX',
        color,
        deadlineDate,
        leadAssigneeId,
        lead?.name || 'Unassigned'
      );
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Projects & Deadlines</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Overview of VFX production projects, assigned leads, team allocation, and target milestones
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map(project => {
          const projectTasks = tasks.filter(t => t.project === project.name);
          const completedTasks = projectTasks.filter(t => t.status === 'Completed').length;
          const totalTasks = projectTasks.length || 1;
          const progressPercent = Math.round((completedTasks / totalTasks) * 100);

          // Find unique artists working on this project
          const assignedArtists = Array.from(new Set(projectTasks.map(t => t.assignedToName)));

          // Check if deadline is near (within 3 days or passed)
          const isNearDeadline = project.deadlineDate && project.deadlineDate <= '2026-11-01';

          return (
            <div
              key={project.id}
              className={`bg-white dark:bg-[#121826] border rounded-card p-6 flex flex-col justify-between shadow-xs transition-all ${
                isNearDeadline
                  ? 'border-amber-400 dark:border-amber-500/50'
                  : 'border-slate-200 dark:border-[#222E46]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.code || 'VFX'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{project.name}</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-400">Code: {project.code}</p>
                    </div>
                  </div>

                  {isNearDeadline && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Deadline Near</span>
                    </span>
                  )}
                </div>

                {/* Milestone & Assignee Ribbon */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] text-xs mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Lead Supervisor
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {project.leadAssigneeName || 'Unassigned'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Project Deadline
                    </span>
                    <p className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                      {project.deadlineDate || 'TBD'}
                    </p>
                  </div>
                </div>

                {/* Assigned Artists Chips */}
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Assigned Artists ({assignedArtists.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {assignedArtists.length > 0 ? (
                      assignedArtists.map((artist, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] text-[11px] font-medium text-slate-700 dark:text-slate-300"
                        >
                          {artist}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No artists assigned yet</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                {/* Progress bar */}
                <div className="pt-3 border-t border-slate-200 dark:border-[#222E46]">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                    <span>Shots Completed</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {completedTasks} / {projectTasks.length} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-[#182030] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: project.color,
                        width: `${progressPercent}%`,
                      }}
                    />
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-[#222E46]">
                    <button
                      onClick={() => openEditModal(project)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#182030] transition-colors"
                      title="Edit Project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete project "${project.name}"?`)) deleteProject(project.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-[#182030] transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProjectId ? 'Edit VFX Project' : 'Create New VFX Project'}
        subtitle="Set project code, milestone deadline date, and assigned lead supervisor"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Sci-Fi Short Film VFX"
              className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Project Code
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="e.g. SCIFI-01"
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Theme Color
              </label>
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-200 dark:border-[#222E46] bg-transparent cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Project Milestone Deadline
              </label>
              <input
                type="date"
                required
                value={deadlineDate}
                onChange={e => setDeadlineDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Assigned Lead Supervisor
              </label>
              <select
                value={leadAssigneeId}
                onChange={e => setLeadAssigneeId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#222E46]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-[#182030]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20"
            >
              {editingProjectId ? 'Save Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
