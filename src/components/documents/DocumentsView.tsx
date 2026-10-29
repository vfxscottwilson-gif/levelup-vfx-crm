import React, { useState } from 'react';
import {
  KeyRound,
  Plus,
  Search,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Edit2,
  Shield,
  FileCode,
  Server,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { DocumentItem } from '../../types';
import { Modal } from '../ui/Modal';

export const DocumentsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { documents, createDocument, updateDocument, deleteDocument } = useData();

  const isAdmin = currentUser?.role === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [revealedIds, setRevealedIds] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentItem['category']>('API Credentials');
  const [description, setDescription] = useState('');
  const [keyOrUsername, setKeyOrUsername] = useState('');
  const [valueOrPassword, setValueOrPassword] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isSecret, setIsSecret] = useState(true);

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openCreateModal = () => {
    setEditingDoc(null);
    setTitle('');
    setCategory('API Credentials');
    setDescription('');
    setKeyOrUsername('');
    setValueOrPassword('');
    setLinkUrl('');
    setIsSecret(true);
    setIsModalOpen(true);
  };

  const openEditModal = (doc: DocumentItem) => {
    setEditingDoc(doc);
    setTitle(doc.title);
    setCategory(doc.category);
    setDescription(doc.description);
    setKeyOrUsername(doc.keyOrUsername);
    setValueOrPassword(doc.valueOrPassword);
    setLinkUrl(doc.linkUrl || '');
    setIsSecret(doc.isSecret);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !valueOrPassword.trim()) return;

    if (editingDoc) {
      updateDocument({
        id: editingDoc.id,
        title: title.trim(),
        category,
        description: description.trim(),
        keyOrUsername: keyOrUsername.trim(),
        valueOrPassword: valueOrPassword.trim(),
        linkUrl: linkUrl.trim(),
        isSecret,
      });
    } else {
      createDocument({
        title: title.trim(),
        category,
        description: description.trim(),
        keyOrUsername: keyOrUsername.trim(),
        valueOrPassword: valueOrPassword.trim(),
        linkUrl: linkUrl.trim(),
        isSecret,
      });
    }

    setIsModalOpen(false);
  };

  const filteredDocs = documents.filter(doc => {
    if (selectedCategory !== 'ALL' && doc.category !== selectedCategory) return false;
    if (
      searchQuery &&
      !doc.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !doc.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !doc.keyOrUsername.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const categories: DocumentItem['category'][] = [
    'API Credentials',
    'Server Access',
    'Client Portals',
    'Software Licenses',
    'Pipeline Specs',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Documentation & Secure Vault</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Encrypted storage for VFX server access, ShotGrid APIs, render farm credentials, and pipelines
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Credential / Doc</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search credentials or API keys..."
            className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-[#182030] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Vault
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#182030] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vault Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map(doc => {
          const isRevealed = !!revealedIds[doc.id];
          const isCopied = copiedId === doc.id;

          return (
            <div
              key={doc.id}
              className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] rounded-card p-5 flex flex-col justify-between shadow-xs transition-all hover:border-blue-500/50"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                    {doc.category}
                  </span>
                  <span className="text-[10px] text-slate-400">Updated: {doc.updatedAt}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{doc.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{doc.description}</p>

                {/* Secret Key / Password Box */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] space-y-2 mb-3">
                  {doc.keyOrUsername && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Identifier / Username:</span>
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 text-[11px] truncate max-w-[200px]">
                        {doc.keyOrUsername}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-[#222E46]/60">
                    <span className="text-slate-400 text-xs font-medium">Secret Key / Password:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white tracking-wider">
                        {!doc.isSecret || isRevealed ? doc.valueOrPassword : '••••••••••••••••••••'}
                      </span>

                      {doc.isSecret && (
                        <button
                          onClick={() => toggleReveal(doc.id)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          title={isRevealed ? 'Hide' : 'Reveal'}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      <button
                        onClick={() => handleCopy(doc.valueOrPassword, doc.id)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#222E46] text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-50 transition-colors"
                        title="Copy to clipboard"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {doc.linkUrl && (
                  <a
                    href={doc.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Associated Service Portal</span>
                  </a>
                )}
              </div>

              {isAdmin && (
                <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-slate-200 dark:border-[#222E46]">
                  <button
                    onClick={() => openEditModal(doc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#182030] transition-colors"
                    title="Edit Credential"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${doc.title}" from vault?`)) deleteDocument(doc.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-[#182030] transition-colors"
                    title="Delete Credential"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Credential Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDoc ? 'Edit Credential or Documentation' : 'Add New Credential or Secret'}
        subtitle="Store API keys, server credentials, or client tokens in the encrypted vault"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Autodesk ShotGrid Production API"
              className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Username / Identifier (Optional)
              </label>
              <input
                type="text"
                value={keyOrUsername}
                onChange={e => setKeyOrUsername(e.target.value)}
                placeholder="e.g. script_user or root"
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Secret Password or API Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={valueOrPassword}
              onChange={e => setValueOrPassword(e.target.value)}
              placeholder="e.g. vfx_prod_live_key_99824..."
              className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Portal or Server Link (Optional)
            </label>
            <input
              type="text"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              placeholder="e.g. https://portal.client.com"
              className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Notes on usage or permission levels..."
              className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isSecret"
              checked={isSecret}
              onChange={e => setIsSecret(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
            />
            <label htmlFor="isSecret" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Hide value by default (masked password mode)
            </label>
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
              {editingDoc ? 'Save Changes' : 'Store in Vault'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
