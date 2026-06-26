// AssessmentBadges — read-only display of assessment score and job match %
import React from 'react';
import { Trophy, Target, Star } from 'lucide-react';

const ScoreRing = ({ value, label, color }) => {
  const r = 30, circ = 2 * Math.PI * r;
  const dash = ((value / 100) * circ).toFixed(1);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
          <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
          <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-black text-white">{value}%</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-slate-400">{label}</span>
    </div>
  );
};

export default function AssessmentBadges({ assessmentScore = 0, matchScore = 0 }) {
  const grade = assessmentScore >= 85 ? { label: 'Expert', color: '#10B981' }
    : assessmentScore >= 65 ? { label: 'Proficient', color: '#3B82F6' }
    : assessmentScore >= 40 ? { label: 'Intermediate', color: '#F59E0B' }
    : { label: 'Beginner', color: '#EF4444' };

  return (
    <div className="glass-card p-6">
      <h3 className="font-black text-white flex items-center gap-2 mb-6">
        <Trophy size={16} className="text-yellow-400" /> Assessment & Match
      </h3>
      <div className="flex flex-wrap gap-8 justify-center sm:justify-start">
        <ScoreRing value={assessmentScore} label="Assessment Score" color="#3B82F6" />
        <ScoreRing value={matchScore}      label="Avg Job Match"    color="#8B5CF6" />
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ border: `4px solid ${grade.color}`, background: `${grade.color}15` }}>
            <Star size={28} style={{ color: grade.color }} />
          </div>
          <span className="text-xs font-semibold text-slate-400" style={{ color: grade.color }}>{grade.label}</span>
        </div>
      </div>
      <p className="text-xs text-slate-600 mt-5">
        Complete quizzes in the <span className="text-blue-400">Training Arena</span> to improve your assessment score and get better job matches.
      </p>
    </div>
  );
}
