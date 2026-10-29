import React, { useState } from 'react';
import {
  UserPlus,
  Shield,
  Key,
  Trash2,
  CheckCircle,
  AlertCircle,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { User, UserRole } from '../../types';

export const TeamManagementView: React.FC = () => {
  const { users, createUser, updateUser, deleteUser, resetPassword } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('employee');
  const [errorMessage, setErrorMessage] = useState('');

  const [tempPassNotice, setTempPassNotice] = useState<{ user: string; pass: string } | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const res = createUser(newName, newEmail, newRole);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to create user');
    } else {
      setIsAddModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewRole('employee');
    }
  };

  const handleReset = (user: User) => {
    const tempPass = resetPassword(user.id);
    setTempPassNotice({ user: user.name, pass: tempPass });
  };

  const handleDelete = (userId: string) => {
    if (!confirm('Are you sure you want to remove this account?')) return;
    const res = deleteUser(userId);
    if (!res.success) {
      alert(res.error);
    }
  };

  const handleToggleRole = (user: User) => {
    const nextRole: UserRole = user.role === 'admin' ? 'employee' : 'admin';
    updateUser({ id: user.id, role: nextRole });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Team Accounts & Access Control</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage LEVEL UP VFX crew members, credentials, and security roles (no public sign-up)
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMessage('');
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {tempPassNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div>
            <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Temporary Password Generated</h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
              Account <strong>{tempPassNotice.user}</strong> password was reset to: <code className="bg-white dark:bg-[#121826] px-2 py-0.5 rounded text-blue-600 dark:text-blue-400 font-mono font-bold border border-emerald-200 dark:border-emerald-800">{tempPassNotice.pass}</code>
            </p>
          </div>
          <button
            onClick={() => setTempPassNotice(null)}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 self-start sm:self-auto"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Accounts Table */}
      <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-6 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#222E46] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Artist Profile</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#222E46] text-xs">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-[#182030]/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center font-bold text-xs text-blue-600 dark:text-blue-400">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-[10px] text-slate-400">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-slate-800 dark:text-slate-200 font-mono text-xs">{user.email}</td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        user.role === 'admin'
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900'
                          : 'bg-slate-100 dark:bg-[#182030] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#222E46]'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleRole(user)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-[#182030] hover:bg-slate-200 dark:hover:bg-[#222E46] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#222E46] transition-colors"
                      >
                        {user.role === 'admin' ? 'Demote to Artist' : 'Promote to Admin'}
                      </button>
                      <button
                        onClick={() => handleReset(user)}
                        title="Generate Temporary Password"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-[#182030] rounded-lg transition-colors"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        title="Delete Account"
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-[#182030] rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Team Member"
        subtitle="Create an internal account for LEVEL UP VFX artist or manager"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 font-semibold">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Company Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="e.g. alex@levelupvfx.com"
              className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Initial Role
            </label>
            <select
              value={newRole}
              onChange={e => setNewRole(e.target.value as UserRole)}
              className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="employee">Artist (VFX, 3D, Comp, Roto)</option>
              <option value="admin">Supervisor / Studio Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#222E46]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-[#182030]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
