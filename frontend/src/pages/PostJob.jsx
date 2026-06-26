import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, X, Loader2, ChevronLeft, Globe, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const TYPES   = ['Full-time', 'Part-time', 'Internship', 'Remote'];
const DOMAINS = ['Frontend', 'Backend', 'Full Stack', 'Mobile', 'AI/ML', 'DevOps', 'Data', 'Design', 'Product'];

export default function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [skill,   setSkill]   = useState('');
  const [form, setForm] = useState({
    title:'', description:'', location:'', type:'Full-time', domain:'',
    salary:'', experience:'Fresher', deadline:'', requiredSkills:[], perks:'', visibility: 'public'
  });

  const change = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const addSkill = () => {
    if (!skill.trim()) return;
    if (form.requiredSkills.includes(skill.trim())) { toast.error('Skill already added'); return; }
    setForm(p => ({ ...p, requiredSkills: [...p.requiredSkills, skill.trim()] }));
    setSkill('');
  };

  const removeSkill = (s) => setForm(p => ({ ...p, requiredSkills: p.requiredSkills.filter(x => x !== s) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) { toast.error('Title and description are required'); return; }
    setLoading(true);
    try {
      await api.post('/jobs', {
        ...form,
        perks: form.perks.split(',').map(s=>s.trim()).filter(Boolean),
      });
      toast.success('Job posted successfully!');
      navigate('/startup/jobs');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to post job'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
        <ChevronLeft size={18} /> Back
      </button>
      <h1 className="text-3xl font-black text-white font-head mb-8">Post a <span className="grad-text">New Job</span></h1>

      <motion.form onSubmit={handleSubmit} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="space-y-6">
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-lg font-black text-white font-head">Basic Info</h2>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Job Title *</label>
            <input name="title" value={form.title} onChange={change} placeholder="Frontend Developer" required className="cp-input" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Job Type</label>
              <select name="type" value={form.type} onChange={change} className="cp-input">
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Domain</label>
              <select name="domain" value={form.domain} onChange={change} className="cp-input">
                <option value="">Select domain</option>
                {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Location</label>
              <input name="location" value={form.location} onChange={change} placeholder="Bangalore / Remote" className="cp-input" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Salary Range</label>
              <input name="salary" value={form.salary} onChange={change} placeholder="₹6-10 LPA" className="cp-input" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-5">
          <h2 className="text-lg font-black text-white font-head">Description</h2>
          <textarea name="description" value={form.description} onChange={change} placeholder="Describe the role, responsibilities, and what you're looking for..." rows={6} required className="cp-input resize-none" />
        </div>

        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-black text-white font-head">Required Skills</h2>
          <div className="flex gap-2">
            <input value={skill} onChange={e => setSkill(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="e.g. React, Node.js" className="cp-input flex-1" />
            <button type="button" onClick={addSkill} className="btn-secondary px-4"><Plus size={18} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.requiredSkills.map(s => (
              <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-sm font-semibold">
                {s} <button type="button" onClick={() => removeSkill(s)} className="hover:text-red-400"><X size={13} /></button>
              </span>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-black text-white font-head mb-4">Perks</h2>
          <input name="perks" value={form.perks} onChange={change} placeholder="Remote Work, Stock Options, Health Insurance (comma-separated)" className="cp-input" />
        </div>

        <div className="glass-card p-6 space-y-5">
          <h2 className="text-lg font-black text-white font-head">Visibility</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`cursor-pointer flex items-start gap-4 p-4 rounded-xl border transition-all ${form.visibility === 'public' ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-[#0D1530] border-white/10 hover:border-white/30'}`}>
              <input type="radio" name="visibility" value="public" checked={form.visibility === 'public'} onChange={change} className="hidden" />
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Public</h3>
                <p className="text-xs text-slate-400">Anyone can see and apply for this job.</p>
              </div>
            </label>
            <label className={`cursor-pointer flex items-start gap-4 p-4 rounded-xl border transition-all ${form.visibility === 'private' ? 'bg-amber-500/10 border-amber-500/50' : 'bg-[#0D1530] border-white/10 hover:border-white/30'}`}>
              <input type="radio" name="visibility" value="private" checked={form.visibility === 'private'} onChange={change} className="hidden" />
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Followers Only</h3>
                <p className="text-xs text-slate-400">Only approved followers can see and apply.</p>
              </div>
            </label>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60">
          {loading ? <><Loader2 className="animate-spin" size={18} /> Posting...</> : <><Plus size={18} /> Post Job</>}
        </button>
      </motion.form>
    </div>
  );
}
