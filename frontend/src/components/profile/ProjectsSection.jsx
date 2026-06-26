// ProjectsSection — add/edit/delete project cards
import React, { useState } from 'react';
import { Code2, Plus, Trash2, Edit3, Save, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const EMPTY = { title: '', description: '', url: '', techStack: [], year: '' };

function ProjectCard({ proj, onEdit, onDelete }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-white/3 border border-white/8 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-sm">{proj.title}</span>
            {proj.year && <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded">{proj.year}</span>}
            {proj.url && (
              <a href={proj.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300">
                <ExternalLink size={10} /> View
              </a>
            )}
          </div>
          {proj.description && <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">{proj.description}</p>}
          {proj.techStack?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {proj.techStack.map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 bg-purple-500/12 border border-purple-500/20 text-purple-400 rounded-md">{t}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => onEdit(proj)} className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"><Edit3 size={13} /></button>
          <button onClick={() => onDelete(proj._id || proj.tempId)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={13} /></button>
        </div>
      </div>
    </motion.div>
  );
}

function ProjectForm({ initial = EMPTY, onSubmit, onCancel }) {
  const [form, setForm] = useState({ ...initial, techStack: (initial.techStack || []).join(', ') });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-3">
      <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Project Title *" className="cp-input text-sm w-full" />
      <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Short description…" rows={2} className="cp-input text-sm w-full resize-none" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={form.url} onChange={e => set('url', e.target.value)} placeholder="GitHub / Live URL" className="cp-input text-sm" />
        <input type="number" value={form.year} onChange={e => set('year', e.target.value)} placeholder="Year" className="cp-input text-sm" />
      </div>
      <input value={form.techStack} onChange={e => set('techStack', e.target.value)} placeholder="Tech stack (comma-separated: React, Node.js…)" className="cp-input text-sm w-full" />
      <div className="flex gap-2">
        <button onClick={() => {
          if (!form.title) { toast.error('Title is required'); return; }
          onSubmit({ ...form, techStack: form.techStack.split(',').map(t => t.trim()).filter(Boolean) });
        }} className="btn-primary text-xs py-2 px-4"><Save size={13} /> Save</button>
        <button onClick={onCancel} className="btn-secondary text-xs py-2 px-4"><X size={13} /> Cancel</button>
      </div>
    </div>
  );
}

export default function ProjectsSection({ projects = [], onSave, saving }) {
  const [items, setItems] = useState(projects);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const persist = async (updated) => { await onSave({ projects: updated }); toast.success('Projects saved!'); };

  const handleAdd    = f => { const u = [...items, { ...f, tempId: Date.now() }]; setItems(u); setShowForm(false); persist(u); };
  const handleEdit   = f => { const u = items.map(i => ((i._id||i.tempId)===(editItem._id||editItem.tempId) ? { ...i, ...f } : i)); setItems(u); setEditItem(null); persist(u); };
  const handleDelete = id => { const u = items.filter(i => (i._id||i.tempId) !== id); setItems(u); persist(u); };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-black text-white flex items-center gap-2"><Code2 size={16} className="text-purple-400" /> Projects</h3>
        <button onClick={() => { setShowForm(true); setEditItem(null); }}
          className="flex items-center gap-1.5 text-xs font-bold text-purple-400 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-all">
          <Plus size={13} /> Add Project
        </button>
      </div>
      <AnimatePresence>{showForm && <ProjectForm key="pf" onSubmit={handleAdd} onCancel={() => setShowForm(false)} />}</AnimatePresence>
      {items.length === 0 && !showForm ? (
        <div className="flex flex-col items-center py-10 text-slate-600">
          <Code2 size={36} className="mb-2 opacity-30" />
          <p className="text-sm">No projects added yet</p>
          <p className="text-xs mt-1">Showcase your work to recruiters</p>
        </div>
      ) : (
        <div className="space-y-3 mt-2">
          {items.map(p => editItem && (editItem._id||editItem.tempId) === (p._id||p.tempId) ? (
            <ProjectForm key={p._id||p.tempId} initial={p} onSubmit={handleEdit} onCancel={() => setEditItem(null)} />
          ) : (
            <ProjectCard key={p._id||p.tempId} proj={p} onEdit={e => { setEditItem(e); setShowForm(false); }} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
