// ApplicationHistory — read-only list of jobs applied to with status badges
import React from 'react';
import { Briefcase, ExternalLink, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_STYLES = {
  Applied:      'badge-blue',
  Shortlisted:  'badge-purple',
  Interviewing: 'badge-amber',
  Selected:     'badge-green',
  Hired:        'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 text-xs font-bold rounded-lg',
  Rejected:     'badge-red',
};

export default function ApplicationHistory({ applications = [] }) {
  return (
    <div className="glass-card p-6">
      <h3 className="font-black text-white flex items-center gap-2 mb-5">
        <Briefcase size={16} className="text-blue-400" /> Applications
        <span className="text-xs font-normal text-slate-500">({applications.length})</span>
      </h3>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-slate-600">
          <Briefcase size={36} className="mb-2 opacity-30" />
          <p className="text-sm">No applications yet</p>
          <p className="text-xs mt-1">Apply to jobs to see your history here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app._id}
              className="flex items-center gap-4 p-3.5 rounded-xl bg-white/3 border border-white/8 hover:border-blue-500/20 transition-all">
              <div className="w-9 h-9 rounded-xl bg-blue-500/12 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-sm font-black text-blue-400">
                {app.jobId?.company?.[0] || 'J'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white text-sm truncate">{app.jobId?.title || 'Job'}</span>
                  {app.matchPercentage > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      app.matchPercentage >= 75 ? 'text-green-400 bg-green-500/12'
                      : app.matchPercentage >= 40 ? 'text-amber-400 bg-amber-500/12'
                      : 'text-red-400 bg-red-500/12'
                    }`}>{app.matchPercentage}% match</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span>{app.jobId?.company}</span>
                  {app.jobId?.location && <><span>·</span><span>{app.jobId.location}</span></>}
                  <span>·</span>
                  <Clock size={10} />
                  <span>{new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={STATUS_STYLES[app.status] || 'badge-blue'}>{app.status}</span>
                {app.jobId?._id && (
                  <Link to={`/fresher/jobs/${app.jobId._id}`}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                    <ExternalLink size={13} />
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
