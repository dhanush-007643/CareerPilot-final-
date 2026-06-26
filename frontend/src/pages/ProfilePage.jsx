import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Save, X, Plus, Loader2, Mail, GraduationCap, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ResumeSection from '../components/ResumeSection';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [skill, setSkill]     = useState('');
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    college: user?.college || '',
    graduationYear: user?.graduationYear || '',
    cgpa: user?.cgpa || '',
    companyName: user?.companyName || '',
    skills: user?.skills || [],
  });

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const addSkill = () => {
    if (!skill.trim() || form.skills.includes(skill.trim())) return;
    setForm((p) => ({ ...p, skills: [...p.skills, skill.trim()] }));
    setSkill('');
  };
  const removeSkill = (s) =>
    setForm((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', form);
      if (res.data.success) {
        updateUser(res.data.data);
        toast.success('Profile updated!');
        setEditing(false);
      }
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const isFresher = user?.role === 'fresher';

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-black text-white font-head mb-8">
        My <span className="grad-text">Profile</span>
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        {/* Avatar + Name */}
        <div className="flex items-center gap-5 mb-8 pb-6 border-b border-white/10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-black flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">{user?.name}</h2>
            <p className="text-sm text-slate-400 flex items-center gap-1.5">
              <Mail size={13} /> {user?.email}
            </p>
            <span
              className={`mt-2 inline-block text-xs font-bold px-2.5 py-1 rounded-lg ${
                isFresher
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                  : 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
              }`}
            >
              {user?.role === 'startup' ? '🏢 Startup' : '🎓 Fresher'}
            </span>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="ml-auto btn-secondary text-sm py-2 px-4"
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            {editing ? (
              <input
                name="name"
                value={form.name}
                onChange={change}
                className="cp-input"
              />
            ) : (
              <p className="text-white font-semibold">{user?.name || '—'}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Bio
            </label>
            {editing ? (
              <textarea
                name="bio"
                value={form.bio}
                onChange={change}
                rows={3}
                className="cp-input resize-none"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-slate-300">{user?.bio || 'No bio set.'}</p>
            )}
          </div>

          {isFresher && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    <GraduationCap size={12} className="inline mr-1" />
                    College
                  </label>
                  {editing ? (
                    <input
                      name="college"
                      value={form.college}
                      onChange={change}
                      className="cp-input"
                    />
                  ) : (
                    <p className="text-white font-semibold">
                      {user?.college || '—'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    CGPA
                  </label>
                  {editing ? (
                    <input
                      name="cgpa"
                      type="number"
                      step="0.1"
                      value={form.cgpa}
                      onChange={change}
                      className="cp-input"
                    />
                  ) : (
                    <p className="text-white font-semibold">
                      {user?.cgpa || '—'}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Skills
                </label>
                {editing && (
                  <div className="flex gap-2 mb-3">
                    <input
                      value={skill}
                      onChange={(e) => setSkill(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && (e.preventDefault(), addSkill())
                      }
                      placeholder="Add a skill..."
                      className="cp-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="btn-secondary px-3"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {(editing ? form.skills : user?.skills || []).map((s) => (
                    <span
                      key={s}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-sm font-semibold"
                    >
                      {s}
                      {editing && (
                        <button
                          onClick={() => removeSkill(s)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </span>
                  ))}
                  {(editing ? form.skills : user?.skills || []).length === 0 && (
                    <p className="text-slate-600 text-sm">No skills added.</p>
                  )}
                </div>
              </div>

              {/* Assessment Score */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Best Assessment Score
                </label>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-black text-white font-head">
                    {user?.assessmentScore || 0}%
                  </div>
                  {(user?.assessmentScore || 0) >= 70 && (
                    <span className="badge-green">Certificate Earned</span>
                  )}
                </div>
              </div>
            </>
          )}

          {!isFresher && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                <Building2 size={12} className="inline mr-1" />
                Company Name
              </label>
              {editing ? (
                <input
                  name="companyName"
                  value={form.companyName}
                  onChange={change}
                  className="cp-input"
                />
              ) : (
                <p className="text-white font-semibold">
                  {user?.companyName || '—'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Save button */}
        {editing && (
          <div className="mt-8 pt-6 border-t border-white/10 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex-1 justify-center py-3 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Saving...
                </>
              ) : (
                <>
                  <Save size={16} /> Save Changes
                </>
              )}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="btn-secondary px-6"
            >
              Cancel
            </button>
          </div>
        )}
      </motion.div>

      {/* Resume section — shown only for freshers */}
      {user?.role === 'fresher' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="max-w-3xl mx-auto mt-6 px-4 pb-12"
        >
          <ResumeSection />
        </motion.div>
      )}
    </div>
  );
}
