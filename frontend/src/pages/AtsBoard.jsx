import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Loader2, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const COLUMNS = ['Applied', 'Shortlisted', 'Interviewing', 'Selected', 'Hired', 'Rejected'];

const colColor = {
  Applied: 'border-blue-500/30 bg-blue-500/5',
  Shortlisted: 'border-amber-500/30 bg-amber-500/5',
  Interviewing: 'border-purple-500/30 bg-purple-500/5',
  Selected: 'border-cyan-500/30 bg-cyan-500/5',
  Hired: 'border-green-500/30 bg-green-500/5',
  Rejected: 'border-red-500/30 bg-red-500/5',
};

const colDot = {
  Applied: 'bg-blue-400',
  Shortlisted: 'bg-amber-400',
  Interviewing: 'bg-purple-400',
  Selected: 'bg-cyan-400',
  Hired: 'bg-green-400',
  Rejected: 'bg-red-400',
};

const MatchBadge = ({ pct }) => {
  if (pct >= 75) return <span className="badge-green text-[10px]">{pct}%</span>;
  if (pct >= 40) return <span className="badge-amber text-[10px]">{pct}%</span>;
  return <span className="badge-red text-[10px]">{pct || 0}%</span>;
};

export default function AtsBoard() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard]     = useState({});
  const [loading, setLoading] = useState(true);

  const loadBoard = async () => {
    try {
      const res = await api.get(`/applications/ats/${jobId}`);
      if (res.data.success) setBoard(res.data.data);
    } catch {
      toast.error('Failed to load ATS board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBoard(); }, [jobId]);

  const moveCard = async (appId, newStatus) => {
    try {
      await api.patch(`/applications/${appId}/status`, { status: newStatus });
      toast.success(`Moved to ${newStatus}`);
      loadBoard();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update');
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="text-blue-400 animate-spin" size={36} />
      </div>
    );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-2xl font-black text-white font-head">
            ATS <span className="grad-text">Kanban Board</span>
          </h1>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory">
          {COLUMNS.map((col) => {
            const cards = board[col] || [];
            return (
              <div
                key={col}
                className={`flex-shrink-0 w-72 rounded-2xl border p-4 snap-start ${colColor[col] || 'border-white/10'}`}
              >
                {/* Column header */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-2.5 h-2.5 rounded-full ${colDot[col]}`} />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    {col}
                  </h3>
                  <span className="ml-auto text-xs font-bold text-slate-500 bg-black/20 px-2 py-0.5 rounded-md">
                    {cards.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3 min-h-[120px]">
                  {cards.length === 0 && (
                    <p className="text-xs text-slate-600 text-center py-8">No candidates</p>
                  )}
                  {cards.map((card) => (
                    <motion.div
                      key={card._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-card p-3 cursor-default group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                            {card.userId?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white leading-tight">
                              {card.userId?.name || 'Candidate'}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {card.userId?.email || ''}
                            </div>
                          </div>
                        </div>
                        <MatchBadge pct={card.matchPercentage} />
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {(card.userId?.skills || []).slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/10 text-blue-400 rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Education */}
                      {card.userId?.education?.length > 0 && (
                        <div className="text-[10px] text-slate-400 mb-2 truncate">
                          🎓 {card.userId.education[0].degree} @ {card.userId.education[0].college}
                        </div>
                      )}

                      {/* Resume Links */}
                      {card.resumeUrl && (
                        <div className="flex gap-2 mb-3">
                          <a href={card.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition-colors flex-1 text-center font-bold">
                            View Resume
                          </a>
                          <a href={`/api/resume/download/${card.userId._id}`} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors flex-1 text-center font-bold">
                            Download
                          </a>
                        </div>
                      )}

                      {/* Move buttons */}
                      <div className="flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {COLUMNS.filter((c) => c !== col).map((target) => (
                          <button
                            key={target}
                            onClick={() => moveCard(card._id, target)}
                            className="px-2 py-1 text-[9px] font-bold rounded bg-white/5 border border-white/10 text-slate-400 hover:bg-blue-500/15 hover:text-blue-400 hover:border-blue-500/30 transition-all"
                          >
                            → {target}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
