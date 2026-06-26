// PersonalInfo — editable email, phone, headline, bio
import React, { useState } from 'react';
import { Edit3, Save, X, User, Phone, Mail, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function PersonalInfo({ profile, onSave, saving }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name:     profile?.name     || '',
    headline: profile?.headline || '',
    phone:    profile?.phone    || '',
    bio:      profile?.bio      || '',
  });

  const handleSave = async () => {
    try {
      await onSave(form);
      setEditing(false);
      toast.success('Personal info saved!');
    } catch { toast.error('Failed to save'); }
  };

  const Field = ({ label, icon: Icon, field, type = 'text', multiline = false }) => (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1.5">
        <Icon size={12} /> {label}
      </label>
      {editing ? (
        multiline ? (
          <textarea
            value={form[field]}
            onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
            rows={3}
            placeholder={`Enter your ${label.toLowerCase()}…`}
            className="cp-input resize-none text-sm"
          />
        ) : (
          <input
            type={type}
            value={form[field]}
            onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
            placeholder={`Enter your ${label.toLowerCase()}…`}
            className="cp-input text-sm"
          />
        )
      ) : (
        <p className={`text-sm px-1 ${form[field] ? 'text-slate-200' : 'text-slate-600 italic'}`}>
          {form[field] || `No ${label.toLowerCase()} added`}
        </p>
      )}
    </div>
  );

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-black text-white flex items-center gap-2">
          <User size={16} className="text-blue-400" /> Personal Info
        </h3>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-all">
            <Edit3 size={13} /> Edit
          </button>
        ) : (
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Full Name"  icon={User}     field="name" />
        <Field label="Phone"      icon={Phone}    field="phone" type="tel" />
        <Field label="Headline"   icon={FileText} field="headline" />
        <Field label="Email"      icon={Mail}     field="bio" />
      </div>
      <div className="mt-5">
        <Field label="Bio"        icon={FileText} field="bio" multiline />
      </div>
    </div>
  );
}
