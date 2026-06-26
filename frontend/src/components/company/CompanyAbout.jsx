import React, { useState } from 'react';
import { FileText, Edit3, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CompanyAbout({ profile, isOwner, onSave, saving }) {
  const [editing, setEditing] = useState(false);
  const [desc, setDesc] = useState(profile?.description || '');

  const handleSave = async () => {
    try {
      await onSave({ description: desc });
      setEditing(false);
      toast.success('Description saved!');
    } catch { toast.error('Failed to save description'); }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-white flex items-center gap-2">
          <FileText size={16} className="text-blue-400" /> About Company
        </h3>
        {isOwner && !editing && (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-all">
            <Edit3 size={13} /> Edit
          </button>
        )}
        {isOwner && editing && (
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 text-xs font-bold bg-blue-500 hover:bg-blue-400 text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-60">
              <Save size={13} /> Save
            </button>
            <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
              <X size={13} /> Cancel
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <textarea
          value={desc}
          onChange={e => setDesc(e.target.value)}
          rows={5}
          placeholder="Write a brief description about the company..."
          className="cp-input resize-none text-sm w-full"
        />
      ) : (
        <p className={`text-sm leading-relaxed ${profile?.description ? 'text-slate-300' : 'text-slate-600 italic'}`}>
          {profile?.description || 'No description provided.'}
        </p>
      )}
    </div>
  );
}
