// CertificationsSection — add/edit/delete certification cards
import React, { useState } from 'react';
import { Award, Plus, Trash2, Edit3, Save, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const EMPTY = { name: '', issuer: '', year: '', url: '' };

function CertCard({ cert, onEdit, onDelete }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/8 group">
      <div className="w-10 h-10 rounded-xl bg-amber-500/12 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
        <Award size={18} className="text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-white text-sm">{cert.name}</span>
          {cert.url && (
            <a href={cert.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300">
              <ExternalLink size={10} /> Verify
            </a>
          )}
        </div>
        <div className="flex gap-2 text-xs text-slate-500 mt-0.5">
          <span>{cert.issuer}</span>
          {cert.year && <><span>·</span><span>{cert.year}</span></>}
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={() => onEdit(cert)} className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"><Edit3 size={13} /></button>
        <button onClick={() => onDelete(cert._id || cert.tempId)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={13} /></button>
      </div>
    </motion.div>
  );
}

function CertForm({ initial = EMPTY, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Certificate Name *" className="cp-input text-sm" />
        <input value={form.issuer} onChange={e => set('issuer', e.target.value)} placeholder="Issuer (e.g. Google, Coursera) *" className="cp-input text-sm" />
        <input type="number" value={form.year} onChange={e => set('year', e.target.value)} placeholder="Year" className="cp-input text-sm" />
        <input value={form.url} onChange={e => set('url', e.target.value)} placeholder="Credential URL (optional)" className="cp-input text-sm" />
      </div>
      <div className="flex gap-2">
        <button onClick={() => {
          if (!form.name || !form.issuer) { toast.error('Name and issuer are required'); return; }
          onSubmit(form);
        }} className="btn-primary text-xs py-2 px-4"><Save size={13} /> Save</button>
        <button onClick={onCancel} className="btn-secondary text-xs py-2 px-4"><X size={13} /> Cancel</button>
      </div>
    </div>
  );
}

export default function CertificationsSection({ certifications = [], onSave }) {
  const [items, setItems] = useState(certifications);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const persist = async (updated) => { await onSave({ certifications: updated }); toast.success('Certifications saved!'); };
  const handleAdd    = f => { const u = [...items, { ...f, tempId: Date.now() }]; setItems(u); setShowForm(false); persist(u); };
  const handleEdit   = f => { const u = items.map(i => ((i._id||i.tempId)===(editItem._id||editItem.tempId) ? { ...i, ...f } : i)); setItems(u); setEditItem(null); persist(u); };
  const handleDelete = id => { const u = items.filter(i => (i._id||i.tempId) !== id); setItems(u); persist(u); };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-black text-white flex items-center gap-2"><Award size={16} className="text-amber-400" /> Certifications</h3>
        <button onClick={() => { setShowForm(true); setEditItem(null); }}
          className="flex items-center gap-1.5 text-xs font-bold text-amber-400 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-all">
          <Plus size={13} /> Add
        </button>
      </div>
      <AnimatePresence>{showForm && <CertForm key="cf" onSubmit={handleAdd} onCancel={() => setShowForm(false)} />}</AnimatePresence>
      {items.length === 0 && !showForm ? (
        <div className="flex flex-col items-center py-10 text-slate-600">
          <Award size={36} className="mb-2 opacity-30" />
          <p className="text-sm">No certifications yet</p>
          <p className="text-xs mt-1">Add Google, AWS, or Coursera certificates</p>
        </div>
      ) : (
        <div className="space-y-3 mt-2">
          {items.map(c => editItem && (editItem._id||editItem.tempId)===(c._id||c.tempId) ? (
            <CertForm key={c._id||c.tempId} initial={c} onSubmit={handleEdit} onCancel={() => setEditItem(null)} />
          ) : (
            <CertCard key={c._id||c.tempId} cert={c} onEdit={e => { setEditItem(e); setShowForm(false); }} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
