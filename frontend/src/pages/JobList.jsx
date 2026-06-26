import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, MapPin, Briefcase, Loader2, SlidersHorizontal, Globe, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const MatchBadge = ({ pct }) => {
  if (pct >= 75) return <span className="badge-green">{pct}% Match</span>;
  if (pct >= 40) return <span className="badge-amber">{pct}% Match</span>;
  return <span className="badge-red">{pct || 0}% Match</span>;
};

export default function JobList() {
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [type,   setType]     = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/jobs');
        if (res.data.success) setJobs(res.data.data);
      } catch { toast.error('Failed to load jobs'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    const matchSearch = !q || j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q) || j.domain?.toLowerCase().includes(q);
    const matchType   = !type || j.type === type;
    return matchSearch && matchType;
  });

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white font-head mb-1">
          Browse <span className="grad-text">Jobs</span>
        </h1>
        <p className="text-slate-400">Sorted by your skill match percentage.</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-8 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs, companies, skills..."
            className="cp-input pl-9 bg-transparent border-0 focus:ring-0 border-b border-white/10" />
        </div>
        <select value={type} onChange={e => setType(e.target.value)} className="cp-input md:w-48">
          <option value="">All Types</option>
          {['Full-time','Part-time','Internship','Remote'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-blue-400 animate-spin" size={36} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase className="text-slate-700 mx-auto mb-4" size={48} />
          <p className="text-slate-500 text-lg font-semibold">No jobs found.</p>
          <p className="text-slate-600 text-sm mt-1">Try adjusting your search or seed the database at <code className="text-blue-400">/api/seed</code></p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((job, i) => (
            <motion.div key={job._id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/fresher/jobs/${job._id}`}
                className="glass-card p-6 block hover:-translate-y-1 hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center text-xl font-black text-white flex-shrink-0">
                    {job.company?.[0] || 'C'}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <MatchBadge pct={job.matchPercentage} />
                    {job.visibility === 'private' ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
                        <Lock size={10} /> Private
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 rounded-md">
                        <Globe size={10} /> Public
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-black text-white font-head mb-1">{job.title}</h3>
                <p className="text-sm text-blue-400 font-semibold mb-3">{job.company}</p>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1"><MapPin size={11} />{job.location || 'Remote'}</span>
                  <span className="flex items-center gap-1"><Briefcase size={11} />{job.type}</span>
                  {job.salary && <span className="text-green-400 font-semibold">{job.salary}</span>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(job.requiredSkills || []).slice(0, 4).map((s) => (
                    <span key={s} className="px-2 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/15 rounded-md">{s}</span>
                  ))}
                  {(job.requiredSkills?.length || 0) > 4 && <span className="px-2 py-0.5 text-xs text-slate-600">+{job.requiredSkills.length - 4} more</span>}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
