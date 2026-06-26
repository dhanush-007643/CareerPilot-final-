import React from 'react';
import { Briefcase, Clock, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CompanyJobs({ jobs = [], isOwner }) {
  return (
    <div className="glass-card p-6">
      <h3 className="font-black text-white flex items-center gap-2 mb-5">
        <Briefcase size={16} className="text-blue-400" /> Active Job Postings
        <span className="text-xs font-normal text-slate-500">({jobs.length})</span>
      </h3>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-slate-600">
          <Briefcase size={32} className="mb-2 opacity-30" />
          <p className="text-sm">No active job postings</p>
          {isOwner && (
            <Link to="/startup/post-job" className="mt-3 text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
              Post a Job <ArrowRight size={12} />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all group">
              <div>
                <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">{job.title}</h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Briefcase size={12}/> {job.type}</span>
                  <span className="flex items-center gap-1"><Clock size={12}/> {new Date(job.createdAt).toLocaleDateString()}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${job.visibility === 'public' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {job.visibility}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isOwner ? (
                  <Link to={`/startup/ats/${job._id}`} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all" title="View ATS Board">
                    <Users size={16} />
                  </Link>
                ) : (
                  <Link to={`/fresher/jobs/${job._id}`} className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-bold hover:bg-blue-400 transition-all">
                    Apply
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
