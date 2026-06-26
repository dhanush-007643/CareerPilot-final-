import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Award, Clock, CheckCircle2, XCircle, Loader2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function TrainingArena() {
  const [quizzes, setQuizzes]   = useState([]);
  const [active,  setActive]    = useState(null);
  const [answers, setAnswers]   = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [result,  setResult]    = useState(null);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/quizzes')
      .then(r => { if (r.data.success) setQuizzes(r.data.data); })
      .finally(() => setLoading(false));
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!active || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(p => { if (p <= 1) { handleSubmit(); return 0; } return p - 1; }), 1000);
    return () => clearInterval(t);
  }, [active, timeLeft]);

  const startQuiz = (quiz) => {
    setActive(quiz);
    setAnswers({});
    setResult(null);
    setTimeLeft(quiz.duration * 60);
  };

  const handleSubmit = async () => {
    if (!active) return;
    setSubmitting(true);
    try {
      const res = await api.post('/quizzes/submit', { quizId: active._id, answers });
      setResult(res.data.data);
      setActive(null);
    } catch (e) { toast.error(e.response?.data?.message || 'Submission failed'); }
    finally { setSubmitting(false); }
  };

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="text-blue-400 animate-spin" size={36} /></div>;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white font-head"><span className="grad-text">Training Arena</span></h1>
        <p className="text-slate-400 mt-1">Pass assessments and earn verified certificates.</p>
      </div>

      {/* Result card */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
            className={`glass-card p-8 text-center mb-8 ${result.passed ? 'border-green-500/30' : 'border-red-500/20'}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${result.passed ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
              {result.passed ? <CheckCircle2 className="text-green-400" size={40} /> : <XCircle className="text-red-400" size={40} />}
            </div>
            <h2 className="text-2xl font-black text-white font-head mb-2">{result.passed ? '🎉 You Passed!' : 'Keep Practicing!'}</h2>
            <p className="text-slate-400 mb-4">Score: <span className="text-3xl font-black text-white">{result.score}%</span> ({result.correct}/{result.total} correct)</p>
            {result.passed && result.verificationCode && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl inline-block">
                <div className="text-xs font-bold text-green-400 uppercase tracking-wider mb-1">Certificate Code</div>
                <div className="font-black text-white text-lg font-mono">{result.verificationCode}</div>
              </div>
            )}
            <button onClick={() => setResult(null)} className="btn-primary mt-6">Take Another Assessment</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active quiz */}
      {active && (
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white font-head">{active.title}</h2>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-lg ${timeLeft < 60 ? 'bg-red-500/15 text-red-400 border border-red-500/20 animate-pulse' : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'}`}>
              <Clock size={18} /> {fmt(timeLeft)}
            </div>
          </div>
          <div className="space-y-8">
            {active.questions?.map((q, qi) => (
              <div key={q._id}>
                <p className="font-bold text-white mb-3">Q{qi+1}. {q.questionText}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(q.options || []).map((opt) => (
                    <button key={opt} onClick={() => setAnswers(p => ({ ...p, [q._id]: opt }))}
                      className={`p-3 rounded-xl text-sm font-semibold text-left border transition-all ${answers[q._id] === opt ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' : 'bg-white/3 border-white/10 text-slate-400 hover:bg-white/8 hover:border-white/20'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 justify-center py-3 disabled:opacity-60">
              {submitting ? <><Loader2 className="animate-spin" size={16}/> Grading...</> : 'Submit Assessment'}
            </button>
            <button onClick={() => setActive(null)} className="btn-secondary px-5">Cancel</button>
          </div>
        </div>
      )}

      {/* Quiz list */}
      {!active && !result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {quizzes.length === 0 && (
            <div className="col-span-2 text-center py-16 glass-card">
              <Award className="text-slate-700 mx-auto mb-4" size={48} />
              <p className="text-slate-400 font-bold">No assessments available. Seed the database!</p>
            </div>
          )}
          {quizzes.map((q, i) => (
            <motion.div key={q._id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.08 }}
              className="glass-card p-6 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                <Award size={22} />
              </div>
              <h3 className="text-lg font-black text-white font-head mb-2">{q.title}</h3>
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="badge-blue">{q.questions?.length || 0} Questions</span>
                <span className="badge-purple">{q.duration || 30} min</span>
                <span className="badge-green">Pass: {q.passMark || 70}%</span>
              </div>
              <button onClick={() => startQuiz(q)} className="btn-primary w-full justify-center">
                Start Assessment <ChevronRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
