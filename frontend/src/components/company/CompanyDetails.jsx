import React, { useState } from 'react';
import { Info, Edit3, Save, X, Globe, Mail, MapPin, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CompanyDetails({ profile, isOwner, onSave, saving }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    industry: profile?.industry || '',
    location: profile?.location || '',
    websiteUrl: profile?.websiteUrl || '',
    contactEmail: profile?.contactEmail || '',
    visibility: profile?.visibility || 'public',
  });

  const handleSave = async () => {
    try {
      await onSave(form);
      setEditing(false);
      toast.success('Company details saved!');
    } catch { toast.error('Failed to save details'); }
  };

  const Field = ({ label, icon: Icon, field, type = 'text' }) => (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1.5">
        <Icon size={12} /> {label}
      </label>
      {editing ? (
        <input
          type={type}
          value={form[field]}
          onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
          placeholder={`Enter ${label.toLowerCase()}...`}
          className="cp-input text-sm w-full"
        />
      ) : (
        <p className={`text-sm px-1 ${form[field] ? 'text-slate-200' : 'text-slate-600 italic'}`}>
          {form[field] || `No ${label.toLowerCase()}`}
        </p>
      )}
    </div>
  );

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-black text-white flex items-center gap-2">
          <Info size={16} className="text-purple-400" /> Details
        </h3>
        {isOwner && !editing && (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-all">
            <Edit3 size={13} /> Edit
          </button>
        )}
        {isOwner && editing && (
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 text-xs font-bold bg-purple-500 hover:bg-purple-400 text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-60">
              <Save size={13} /> Save
            </button>
            <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
              <X size={13} /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Industry" icon={Briefcase} field="industry" />
        <Field label="Location" icon={MapPin} field="location" />
        <Field label="Website" icon={Globe} field="websiteUrl" />
        <Field label="Contact Email" icon={Mail} field="contactEmail" type="email" />
      </div>

      {isOwner && editing && (
        <div className="mt-5 p-4 rounded-xl bg-white/5 border border-white/10">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-bold text-white block">Profile Visibility</span>
              <span className="text-xs text-slate-400">Public profiles are visible to all users. Private profiles are only visible to your applicants.</span>
            </div>
            <select
              value={form.visibility}
              onChange={e => setForm(p => ({ ...p, visibility: e.target.value }))}
              className="cp-input text-sm py-1.5 px-3 w-32"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
