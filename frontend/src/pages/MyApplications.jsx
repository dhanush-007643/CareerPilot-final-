import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Briefcase, Clock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const statusColor = {
  Applied:'badge-blue', Shortlisted:'badge-amber', Interviewing:'badge-purple',
  Selected:'badge-green', Hired:'badge-green', Rejected:'badge-red'
};
const MatchBadge = ({ pct }) => {
  if (pct >= 75) return <span className="badge-green">{pct}% Match</span>;
  if (pct >= 40) return <span className="badge-amber">{pct}% Match</span>;
  return <span className="badge-red">{pct || 0}%</span>;
};

export default function MyApplications() {
  const [apps,  setApps]  = useState([]);
  const [loading, setLoading] = useState(true);

  const loadApps = () => {
    api.get('/applications/my')
      .then(r => { if (r.data.success) setApps(r.data.data); })
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadApps(); }, []);

  const handleAcceptInvite = async (appId) => {
    try {
      const res = await api.post(`/applications/${appId}/accept-invite`);
      if (res.data.success) {
        toast.success('Invitation accepted!');
        loadApps();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept invitation');
    }
  };

  const invitations = apps.filter(a => a.status === 'Invited');
  const regularApps = apps.filter(a => a.status !== 'Invited');

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="text-blue-400 animate-spin" size={36} /></div>;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white font-head">My <span className="grad-text">Applications</span></h1>
        <p className="text-slate-400 mt-1">{regularApps.length} total applications</p>
      </div>

      {invitations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Pending Invitations</h2>
          <div className="space-y-4">
            {invitations.map((a, i) => (
              <motion.div key={a._id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.05 }}
                className="glass-card p-5 border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-lg font-black text-amber-400 flex-shrink-0">
                    {(a.jobId?.company || 'J')[0]}
                  </div>
                  <div>
                    <div className="font-black text-white text-lg">{a.jobId?.title || 'Job'}</div>
                    <div className="text-sm text-blue-400 font-semibold">{a.jobId?.company || '—'}</div>
                    <p className="text-xs text-slate-400 mt-1">This company has invited you to apply!</p>
                  </div>
                </div>
                <button onClick={() => handleAcceptInvite(a._id)} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition-all">
                  Accept & Apply
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {regularApps.length === 0 ? (
        <div className="text-center py-24 glass-card">
          <Briefcase className="text-slate-700 mx-auto mb-4" size={56} />
          <p className="text-slate-400 text-xl font-bold">No applications yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white mb-2">Applied Jobs</h2>
          {regularApps.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 border border-blue-500/15 flex items-center justify-center text-lg font-black text-white flex-shrink-0">
                  {(a.jobId?.company || 'J')[0]}
                </div>
                <div>
                  <div className="font-black text-white text-lg">{a.jobId?.title || 'Job'}</div>
                  <div className="text-sm text-blue-400 font-semibold">{a.jobId?.company || '—'}</div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <Clock size={11} /> {new Date(a.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <MatchBadge pct={a.matchPercentage} />
                <span className={statusColor[a.status] || 'badge-blue'}>{a.status}</span>
                {a.interview?.dateTime && (
                  <span className="badge-purple flex items-center gap-1">
                    🗓 {new Date(a.interview.dateTime).toLocaleDateString()}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
