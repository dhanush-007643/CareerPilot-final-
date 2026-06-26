import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Briefcase, TrendingUp, Award, Bell, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MatchBadge = ({ pct }) => {
  if (pct >= 75) return <span className="badge-green">{pct}% Match</span>;
  if (pct >= 40) return <span className="badge-amber">{pct}% Match</span>;
  return <span className="badge-red">{pct}% Match</span>;
};

export default function FresherDashboard() {
  const { user } = useAuth();
  const [apps,  setApps]  = useState([]);
  const [jobs,  setJobs]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [appRes, jobRes] = await Promise.all([
          api.get('/applications/my'),
          api.get('/jobs'),
        ]);
        if (appRes.data.success) setApps(appRes.data.data);
        if (jobRes.data.success) setJobs(jobRes.data.data.slice(0, 5));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const statusColor = { Applied:'badge-blue', Shortlisted:'badge-amber', Interviewing:'badge-purple', Selected:'badge-green', Hired:'badge-green', Rejected:'badge-red' };
  const chartData = ['Applied','Shortlisted','Interviewing','Selected','Rejected','Hired'].map((s) => ({
    name: s, count: apps.filter((a) => a.status === s).length,
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
            Welcome back, <span className="grad-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1">Here's your job search overview.</p>
        </div>
        <Link to="/fresher/jobs" className="btn-primary">
          <Briefcase size={16} /> Browse Jobs
        </Link>
      </div>

      {/* Profile Completion Gate Banner */}
      {(user?.profileCompletion < 60) && (
        <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <span className="font-black text-sm">!</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Your profile is incomplete ({user?.profileCompletion || 0}%)</h3>
              <p className="text-amber-200/70 text-xs mt-1">
                Recruiters are less likely to shortlist incomplete profiles. Please complete your profile and upload a resume before applying.
              </p>
            </div>
          </div>
          <Link to="/fresher/profile" className="whitespace-nowrap px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#0A0F1E] font-black text-xs rounded-lg transition-colors">
            Complete Profile
          </Link>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label:'Total Applied',  val: apps.length,                                         icon: Briefcase,   color:'blue'   },
          { label:'Shortlisted',    val: apps.filter(a=>a.status==='Shortlisted').length,     icon: TrendingUp,  color:'amber'  },
          { label:'Hired',          val: apps.filter(a=>a.status==='Hired').length,           icon: Award,       color:'green'  },
          { label:'Skill Score',    val: `${user?.assessmentScore || 0}%`,                    icon: Bell,        color:'purple' },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            className="glass-card p-5 hover:-translate-y-0.5 transition-transform">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3
              ${s.color==='blue'?'bg-blue-500/15 border-blue-500/20 text-blue-400':
                s.color==='amber'?'bg-amber-500/15 border-amber-500/20 text-amber-400':
                s.color==='green'?'bg-green-500/15 border-green-500/20 text-green-400':
                'bg-purple-500/15 border-purple-500/20 text-purple-400'}`}>
              <s.icon size={18} />
            </div>
            <div className="text-2xl font-black text-white font-head">{s.val}</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Pipeline Chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <h2 className="text-lg font-black text-white font-head mb-6">Application Pipeline</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={28}>
              <XAxis dataKey="name" tick={{ fill:'#64748B', fontSize:11, fontWeight:700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#64748B', fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background:'#0D1530', border:'1px solid rgba(59,130,246,0.2)', borderRadius:12, color:'#F1F5F9' }} cursor={{ fill:'rgba(59,130,246,0.05)' }} />
              <Bar dataKey="count" fill="url(#barGrad)" radius={[6,6,0,0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Matched Jobs */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-white font-head">Top Matches</h2>
            <Link to="/fresher/jobs" className="text-xs text-blue-400 hover:text-blue-300 font-bold">View all →</Link>
          </div>
          <div className="space-y-3">
            {jobs.length === 0 && <p className="text-slate-500 text-sm">No jobs yet. Seed the database!</p>}
            {jobs.map((job) => (
              <Link key={job._id} to={`/fresher/jobs/${job._id}`}
                className="flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/6 border border-white/5 hover:border-blue-500/20 transition-all group">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{job.title}</div>
                  <div className="text-xs text-slate-500 truncate">{job.company} · {job.type}</div>
                </div>
                <MatchBadge pct={job.matchPercentage ?? 0} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent applications */}
      <div className="glass-card p-6 mt-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-white font-head">Recent Applications</h2>
          <Link to="/fresher/applications" className="text-xs text-blue-400 hover:text-blue-300 font-bold">View all →</Link>
        </div>
        {apps.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="text-slate-700 mx-auto mb-3" size={40} />
            <p className="text-slate-500 font-semibold">No applications yet.</p>
            <Link to="/fresher/jobs" className="btn-primary mt-4 inline-flex text-sm">Browse Jobs</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-white/5">
                  <th className="pb-3 pr-4">Job</th>
                  <th className="pb-3 pr-4">Company</th>
                  <th className="pb-3 pr-4">Match</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {apps.slice(0, 8).map((a) => (
                  <tr key={a._id} className="hover:bg-white/2 transition-colors">
                    <td className="py-3 pr-4 font-semibold text-white">{a.jobId?.title || '—'}</td>
                    <td className="py-3 pr-4 text-slate-400">{a.jobId?.company || '—'}</td>
                    <td className="py-3 pr-4"><MatchBadge pct={a.matchPercentage} /></td>
                    <td className="py-3 pr-4">
                      <span className={statusColor[a.status] || 'badge-blue'}>{a.status}</span>
                    </td>
                    <td className="py-3 text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
