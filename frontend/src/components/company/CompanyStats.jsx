import React from 'react';
import { BarChart2, Users, CheckCircle, Award } from 'lucide-react';

export default function CompanyStats({ stats }) {
  const { totalApplicants = 0, shortlisted = 0, hired = 0 } = stats || {};

  return (
    <div className="glass-card p-6">
      <h3 className="font-black text-white flex items-center gap-2 mb-5">
        <BarChart2 size={16} className="text-amber-400" /> Recruitment Stats
      </h3>

      <div className="space-y-4">
        {/* Total Applicants */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Users size={18} />
          </div>
          <div>
            <div className="text-2xl font-black text-white leading-none">{totalApplicants}</div>
            <div className="text-xs text-blue-400 font-semibold mt-0.5">Total Applicants</div>
          </div>
        </div>

        {/* Shortlisted */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <CheckCircle size={18} />
          </div>
          <div>
            <div className="text-2xl font-black text-white leading-none">{shortlisted}</div>
            <div className="text-xs text-purple-400 font-semibold mt-0.5">Candidates Shortlisted</div>
          </div>
        </div>

        {/* Hired */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center">
            <Award size={18} />
          </div>
          <div>
            <div className="text-2xl font-black text-white leading-none">{hired}</div>
            <div className="text-xs text-green-400 font-semibold mt-0.5">Successfully Hired</div>
          </div>
        </div>
      </div>
    </div>
  );
}
