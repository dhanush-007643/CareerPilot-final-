import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getResume } from '../services/resumeApi';
import { MapPin, Briefcase, DollarSign, CheckCircle2, Loader2, ArrowLeft, FileText, AlertTriangle, Lock, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const MatchBadge = ({ pct }) => {
  if (pct >= 75) return <span className="badge-green text-base px-3 py-1">{pct}% Match</span>;
  if (pct >= 40) return <span className="badge-amber text-base px-3 py-1">{pct}% Match</span>;
  return <span className="badge-red text-base px-3 py-1">{pct || 0}% Match</span>;
};

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job,      setJob]      = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied,  setApplied]  = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null); // auto-attach on apply

  useEffect(() => {
    const load = async () => {
      try {
        const [jobRes, resumeRes] = await Promise.allSettled([
          api.get(`/jobs/${id}`),
          user?.role === 'fresher' ? getResume(user._id) : Promise.resolve(null),
        ]);
        if (jobRes.status === 'fulfilled' && jobRes.value.data.success)
          setJob(jobRes.value.data.data);
        if (resumeRes.status === 'fulfilled' && resumeRes.value?.data?.s3Url)
          setResumeUrl(resumeRes.value.data.s3Url);
      } catch { toast.error('Failed to load job'); }
      finally { setLoading(false); }
    };
    load();
  }, [id, user]);

  const handleApply = async () => {
    setApplying(true);
    try {
      // Auto-attach resume URL if the fresher has one uploaded
      await api.post('/applications', {
        jobId: id,
        coverLetter: '',
        resumeUrl: resumeUrl || undefined,
      });
      setApplied(true);
      toast.success('Application submitted! 🎉');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to apply');
    } finally { setApplying(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="text-blue-400 animate-spin" size={36} /></div>;
  if (!job) return <div className="min-h-screen flex items-center justify-center text-slate-500">Job not found.</div>;

  if (job.isLocked) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 max-w-4xl mx-auto flex flex-col items-center">
        <button onClick={() => navigate(-1)} className="self-start flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={18} /> Back to Jobs
        </button>
        <div className="glass-card p-12 w-full max-w-lg text-center mt-12 flex flex-col items-center">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
            <Lock className="text-amber-400" size={32} />
          </div>
          <h2 className="text-2xl font-black text-white font-head mb-2">Private Job Posting</h2>
          <p className="text-slate-400 mb-8">This job at <span className="font-bold text-white">{job.company}</span> is only available to their followers.</p>
          <button onClick={() => navigate(`/company/${job.companyId}`)} className="btn-primary w-full justify-center text-base py-3">
            Go to Company Profile to Follow
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} /> Back to Jobs
      </button>

      <div className="glass-card p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
              {job.company?.[0] || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black text-white font-head">{job.title}</h1>
                {job.visibility === 'private' ? (
                  <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
                    <Lock size={12} /> Private
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg">
                    <Globe size={12} /> Public
                  </span>
                )}
              </div>
              <p className="text-blue-400 font-bold mt-1">{job.company}</p>
              <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><MapPin size={14} />{job.location || 'Remote'}</span>
                <span className="flex items-center gap-1.5"><Briefcase size={14} />{job.type}</span>
                {job.salary && <span className="flex items-center gap-1.5 text-green-400 font-semibold"><DollarSign size={14} />{job.salary}</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <MatchBadge pct={job.matchPercentage} />
            {/* Resume auto-attach status */}
            {user?.role === 'fresher' && (
              <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${
                resumeUrl
                  ? 'bg-green-500/12 text-green-400 border border-green-500/20'
                  : 'bg-amber-500/12 text-amber-400 border border-amber-500/20'
              }`}>
                {resumeUrl
                  ? <><FileText size={11} /> Resume attached</>  
                  : <><AlertTriangle size={11} /> No resume — <a href="/fresher/profile" className="underline">upload one</a></> 
                }
              </span>
            )}
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleApply} disabled={applying || applied || (user?.role === 'fresher' && !resumeUrl)}
              className={`btn-primary px-8 py-3 disabled:opacity-60 ${applied ? 'bg-green-600 from-green-600 to-green-700' : ''}`}>
              {applied ? <><CheckCircle2 size={16} /> Applied!</> : applying ? <><Loader2 className="animate-spin" size={16} /> Submitting...</> : 'Apply Now'}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-black text-white font-head mb-4">Job Description</h2>
            <p className="text-slate-400 leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>
          {(job.perks?.length > 0) && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-black text-white font-head mb-4">Perks & Benefits</h2>
              <div className="flex flex-wrap gap-2">
                {job.perks.map(p => (
                  <span key={p} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl text-sm font-semibold">
                    <CheckCircle2 size={12} /> {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="glass-card p-5">
            <h3 className="text-sm font-black text-white font-head mb-4 uppercase tracking-wider">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(job.requiredSkills || []).map(s => (
                <span key={s} className="px-2.5 py-1 text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/15 rounded-lg">{s}</span>
              ))}
            </div>
          </div>
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-sm font-black text-white font-head uppercase tracking-wider">Details</h3>
            {[
              { label:'Experience', val: job.experience || 'Fresher' },
              { label:'Domain',     val: job.domain || '—' },
              { label:'Deadline',   val: job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Open' },
            ].map(d => (
              <div key={d.label} className="flex justify-between text-sm">
                <span className="text-slate-500 font-semibold">{d.label}</span>
                <span className="text-white font-bold">{d.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
