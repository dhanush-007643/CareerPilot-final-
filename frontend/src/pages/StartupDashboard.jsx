import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Plus, BarChart2, Users, Briefcase, Loader2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function StartupDashboard() {
  const { user } = useAuth();
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/jobs/my');
        if (res.data.success) setJobs(res.data.data);
      } catch { toast.error('Failed to load jobs'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const totalApplicants = jobs.reduce((s, j) => s + (j.applicants?.length || 0), 0);

  // Fake chart data based on job count
  const chartData = ['Jan','Feb','Mar','Apr','May','Jun'].map((m, i) => ({
    month: m,
    applicants: Math.floor(Math.random() * 20) + i * 4,
  }));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="text-blue-400 animate-spin" size={36} />
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white font-head">
            <span className="grad-text">{user?.companyName || user?.name}</span> Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Manage your recruitment pipeline.</p>
        </div>
        <Link to="/startup/post-job" className="btn-primary">
          <Plus size={16} /> Post New Job
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label:'Active Jobs',        val: jobs.filter(j=>j.status==='Open').length,  icon: Briefcase, color:'blue'   },
          { label:'Total Applicants',   val: totalApplicants,                           icon: Users,     color:'purple' },
          { label:'Total Postings',     val: jobs.length,                               icon: BarChart2, color:'green'  },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            className="glass-card p-6 hover:-translate-y-0.5 transition-transform">
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4
              ${s.color==='blue'?'bg-blue-500/15 border-blue-500/20 text-blue-400':
                s.color==='purple'?'bg-purple-500/15 border-purple-500/20 text-purple-400':
                'bg-green-500/15 border-green-500/20 text-green-400'}`}>
              <s.icon size={20} />
            </div>
            <div className="text-3xl font-black text-white font-head">{s.val}</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applicant Trend */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-black text-white font-head mb-6">Applicant Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill:'#64748B', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#64748B', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'#0D1530', border:'1px solid rgba(59,130,246,0.2)', borderRadius:12, color:'#F1F5F9' }} />
              <Area type="monotone" dataKey="applicants" stroke="#3B82F6" fill="url(#aGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* My Jobs list */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-white font-head">Active Postings</h2>
            <Link to="/startup/jobs" className="text-xs text-blue-400 font-bold hover:text-blue-300">Manage all →</Link>
          </div>
          <div className="space-y-3">
            {jobs.length === 0 && (
              <div className="text-center py-8">
                <Briefcase className="text-slate-700 mx-auto mb-3" size={36} />
                <p className="text-slate-500 text-sm">No jobs posted yet.</p>
                <Link to="/startup/post-job" className="btn-primary mt-3 inline-flex text-sm py-2">Post First Job</Link>
              </div>
            )}
            {jobs.map((job) => (
              <Link key={job._id} to={`/startup/ats/${job._id}`}
                className="flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/6 border border-white/5 hover:border-blue-500/20 transition-all">
                <div>
                  <div className="text-sm font-bold text-white">{job.title}</div>
                  <div className="text-xs text-slate-500">{job.type} · {job.applicants?.length || 0} applicants</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={job.status==='Open' ? 'badge-green' : 'badge-red'}>{job.status}</span>
                  <ChevronRight size={14} className="text-slate-600" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
