// EducationSection — add/edit/delete education cards
import React, { useState } from 'react';
import { GraduationCap, Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const EMPTY = { degree: '', college: '', fieldOfStudy: '', startYear: '', endYear: '', cgpa: '', current: false };

function EducationCard({ edu, onEdit, onDelete }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-4 p-4 rounded-xl bg-white/3 border border-white/8 group">
      <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
        <GraduationCap size={18} className="text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-white text-sm">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</div>
        <div className="text-blue-400 text-xs font-semibold mt-0.5">{edu.college}</div>
        <div className="flex gap-3 mt-1 text-xs text-slate-500">
          <span>{edu.startYear || '—'} – {edu.current ? 'Present' : edu.endYear || '—'}</span>
          {edu.cgpa && <span>CGPA: {edu.cgpa}</span>}
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(edu)} className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"><Edit3 size={13} /></button>
        <button onClick={() => onDelete(edu._id || edu.tempId)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={13} /></button>
      </div>
    </motion.div>
  );
}

function EducationForm({ initial = EMPTY, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={form.degree} onChange={e => set('degree', e.target.value)} placeholder="Degree (e.g. B.Tech)" className="cp-input text-sm" />
        <input value={form.fieldOfStudy} onChange={e => set('fieldOfStudy', e.target.value)} placeholder="Field of Study (e.g. CSE)" className="cp-input text-sm" />
        <input value={form.college} onChange={e => set('college', e.target.value)} placeholder="College / University" className="cp-input text-sm sm:col-span-2" />
        <input type="number" value={form.startYear} onChange={e => set('startYear', e.target.value)} placeholder="Start Year" className="cp-input text-sm" />
        <input type="number" value={form.endYear} onChange={e => set('endYear', e.target.value)} placeholder="End Year" className="cp-input text-sm" disabled={form.current} />
        <input type="number" value={form.cgpa} onChange={e => set('cgpa', e.target.value)} placeholder="CGPA (optional)" step="0.01" className="cp-input text-sm" />
        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
          <input type="checkbox" checked={form.current} onChange={e => set('current', e.target.checked)} className="accent-blue-500" />
          Currently studying here
        </label>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => { if (!form.degree || !form.college) { toast.error('Degree and college are required'); return; } onSubmit(form); }}
          className="btn-primary text-xs py-2 px-4"><Save size={13} /> Save</button>
        <button onClick={onCancel} className="btn-secondary text-xs py-2 px-4"><X size={13} /> Cancel</button>
      </div>
    </div>
  );
}

export default function EducationSection({ education = [], onSave, saving }) {
  const [items,     setItems]     = useState(education);
  const [showForm,  setShowForm]  = useState(false);
  const [editItem,  setEditItem]  = useState(null);

  const persist = async (updated) => {
    await onSave({ education: updated });
    toast.success('Education saved!');
  };

  const handleAdd = (form) => {
    const newItem = { ...form, tempId: Date.now() };
    const updated = [...items, newItem];
    setItems(updated);
    setShowForm(false);
    persist(updated);
  };

  const handleEdit = (form) => {
    const updated = items.map(i => ((i._id || i.tempId) === (editItem._id || editItem.tempId) ? { ...i, ...form } : i));
    setItems(updated);
    setEditItem(null);
    persist(updated);
  };

  const handleDelete = (id) => {
    const updated = items.filter(i => (i._id || i.tempId) !== id);
    setItems(updated);
    persist(updated);
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-black text-white flex items-center gap-2"><GraduationCap size={16} className="text-blue-400" /> Education</h3>
        <button onClick={() => { setShowForm(true); setEditItem(null); }}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-400 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-all">
          <Plus size={13} /> Add
        </button>
      </div>

      <AnimatePresence>
        {showForm && <EducationForm key="add-form" onSubmit={handleAdd} onCancel={() => setShowForm(false)} />}
      </AnimatePresence>

      {items.length === 0 && !showForm ? (
        <div className="flex flex-col items-center py-10 text-slate-600">
          <GraduationCap size={36} className="mb-2 opacity-30" />
          <p className="text-sm">No education added yet</p>
          <p className="text-xs mt-1">Add your degree to boost your profile score</p>
        </div>
      ) : (
        <div className="space-y-3 mt-2">
          {items.map(edu => editItem && (editItem._id || editItem.tempId) === (edu._id || edu.tempId) ? (
            <EducationForm key={edu._id || edu.tempId} initial={edu} onSubmit={handleEdit} onCancel={() => setEditItem(null)} />
          ) : (
            <EducationCard key={edu._id || edu.tempId} edu={edu} onEdit={e => { setEditItem(e); setShowForm(false); }} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
