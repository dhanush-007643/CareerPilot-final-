import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Briefcase, Users, Trash2, Loader2, Eye, Plus, Globe, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ManageJobs() {
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs/my')
      .then((r) => { if (r.data.success) setJobs(r.data.data); })
      .catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this job posting?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      setJobs((p) => p.filter((j) => j._id !== id));
      toast.success('Job deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="text-blue-400 animate-spin" size={36} />
      </div>
    );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white font-head">
            Manage <span className="grad-text">Jobs</span>
          </h1>
          <p className="text-slate-400 mt-1">{jobs.length} job postings</p>
        </div>
        <Link to="/startup/post-job" className="btn-primary">
          <Plus size={16} /> Post New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-24 glass-card">
          <Briefcase className="text-slate-700 mx-auto mb-4" size={56} />
          <p className="text-slate-400 text-xl font-bold">No jobs posted yet.</p>
          <Link to="/startup/post-job" className="btn-primary mt-5 inline-flex">
            Post Your First Job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job, i) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 border border-blue-500/15 flex items-center justify-center text-lg font-black text-white flex-shrink-0">
                  {job.title?.[0] || 'J'}
                </div>
                <div className="min-w-0">
                  <div className="font-black text-white text-lg truncate flex items-center gap-2">
                    {job.title}
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
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-1">
                    <span>{job.type}</span>
                    <span>·</span>
                    <span>{job.location || 'Remote'}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Users size={11} /> {job.applicants?.length || 0} applicants
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={job.status === 'Open' ? 'badge-green' : 'badge-red'}>
                  {job.status}
                </span>
                <Link
                  to={`/startup/ats/${job._id}`}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
                >
                  <Eye size={13} /> ATS Board
                </Link>
                <button
                  onClick={() => handleDelete(job._id)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
