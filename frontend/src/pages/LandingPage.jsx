import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Building2, Users, TrendingUp, Search, CheckCircle2, Award, ChevronRight } from 'lucide-react';

/* Animated counter */
function Counter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{count.toLocaleString()}{suffix}</>;
}

const FEATURES = [
  { icon: Search,       color: 'blue',   title: 'AI-Powered Job Matching',       desc: 'Skill-based match % ranks every job for you automatically.' },
  { icon: TrendingUp,   color: 'purple', title: 'Visual ATS Pipeline',            desc: 'Track applications through Kanban stages in real time.' },
  { icon: Award,        color: 'cyan',   title: 'Verified Skill Certificates',    desc: 'Pass assessments and earn downloadable PDF certificates.' },
  { icon: Building2,    color: 'green',  title: 'Company Discovery',              desc: 'Follow startups and get invited to private job listings.' },
  { icon: Users,        color: 'yellow', title: 'Candidate Intelligence',         desc: 'Startups get full candidate insights before interviews.' },
  { icon: CheckCircle2, color: 'orange', title: 'Real-Time Notifications',        desc: 'Socket.io powered live alerts for every activity.' },
];

const TESTIMONIALS = [
  { name: 'Alex Mercer', role: 'Frontend Dev @ TechNova', avatar: 'A', grad: 'from-blue-500 to-purple-500', quote: 'Applied to 5 jobs, got 3 interviews. Got hired in 2 weeks!' },
  { name: 'Sarah Chen',  role: 'CTO @ QuantumAI',         avatar: 'S', grad: 'from-purple-500 to-pink-500',  quote: 'CareerPilot cut our hiring time by 60%. The ATS board is incredible.' },
  { name: 'Raj Patel',   role: 'Full Stack @ GlobalWeb',  avatar: 'R', grad: 'from-green-500 to-blue-500',   quote: 'My certificate scores convinced companies before the interview!' },
];

const colorMap = {
  blue: 'bg-blue-500/12 text-blue-400 border-blue-500/20',
  purple: 'bg-purple-500/12 text-purple-400 border-purple-500/20',
  cyan: 'bg-cyan-500/12 text-cyan-400 border-cyan-500/20',
  green: 'bg-green-500/12 text-green-400 border-green-500/20',
  yellow: 'bg-yellow-500/12 text-yellow-400 border-yellow-500/20',
  orange: 'bg-orange-500/12 text-orange-400 border-orange-500/20',
};

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } };

export default function LandingPage() {
  const { isAuth, user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-slate-200 overflow-hidden">

      {/* ═══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 px-6 circuit-bg">
        <div className="orb w-[600px] h-[600px] bg-blue-500/10   -top-40 -right-20" />
        <div className="orb w-[500px] h-[500px] bg-purple-500/8  bottom-0  -left-20" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            AI-Powered Recruitment Platform
          </motion.div>

          <motion.h1 variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black font-head leading-[1.1] tracking-tight text-white mb-6">
            Find Jobs. Hire Talent.<br />
            <span className="grad-text">Build Careers.</span>
          </motion.h1>

          <motion.p variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The modern recruitment ecosystem connecting ambitious freshers with innovative startups.
            Smart skill-matching, real-time ATS tracking, and verified certificates.
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center">
            {isAuth ? (
              <Link to={user?.role === 'startup' ? '/startup/dashboard' : '/fresher/dashboard'} className="btn-primary text-base px-8 py-4">
                Go to Dashboard <ChevronRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/auth?tab=register" className="btn-primary text-base px-8 py-4">
                  Get Started Free <ChevronRight size={18} />
                </Link>
                <Link to="/auth" className="btn-secondary text-base px-8 py-4">Sign In</Link>
              </>
            )}
          </motion.div>

          {/* Floating UI cards */}
          <div className="relative mt-20 hidden lg:block">
            <motion.div animate={{ y: [0,-12,0] }} transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-0 left-8 glass-card p-4 flex items-center gap-3 shadow-2xl">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Briefcase size={18} />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Match</div>
                <div className="text-sm font-black text-white">Frontend Dev · 96%</div>
              </div>
            </motion.div>

            <motion.div animate={{ y: [0,12,0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute top-0 right-8 glass-card p-4 flex items-center gap-3 shadow-2xl">
              <div className="w-9 h-9 rounded-xl bg-green-500/15 border border-green-500/20 flex items-center justify-center text-green-400">
                <CheckCircle2 size={18} />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status Update</div>
                <div className="text-sm font-black text-white">Application · Hired 🎉</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ══════════════════════════════════════════════════════════ */}
      <section className="py-20 border-y border-blue-500/10 bg-gradient-to-b from-blue-500/3 to-transparent">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Building2, color: 'blue',   val: 2500,  suf: '+', label: 'Startups Hiring' },
              { icon: Users,     color: 'purple', val: 50000, suf: '+', label: 'Freshers Placed' },
              { icon: Briefcase, color: 'cyan',   val: 15000, suf: '+', label: 'Jobs Posted' },
              { icon: TrendingUp,color: 'green',  val: 96,    suf: '%', label: 'Satisfaction Rate' },
            ].map((s, i) => (
              <motion.div key={s.label} variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="stat-card">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${colorMap[s.color]}`}>
                  <s.icon size={22} />
                </div>
                <div className="text-3xl font-black text-white font-head mb-1">
                  <Counter target={s.val} suffix={s.suf} />
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BRANDS ════════════════════════════════════════════════════════ */}
      <section className="py-14 overflow-hidden">
        <p className="text-center text-xs font-bold text-slate-600 uppercase tracking-widest mb-8">Trusted by innovative companies worldwide</p>
        <div className="overflow-hidden" style={{ maskImage: 'linear-gradient(90deg, transparent, black 15%, black 85%, transparent)' }}>
          <div className="brands-track">
            {['TechNova', 'GlobalWeb', 'Quantum AI', 'NexusLabs', 'SkyCraft', 'DataFlow', 'PulseApp', 'CoreLab',
              'TechNova', 'GlobalWeb', 'Quantum AI', 'NexusLabs', 'SkyCraft', 'DataFlow', 'PulseApp', 'CoreLab'].map((b, i) => (
              <span key={i} className="text-lg font-black text-slate-700 cursor-default hover:text-slate-500 transition-colors">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-6" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-chip">Platform Features</div>
            <h2 className="text-4xl md:text-5xl font-black font-head text-white leading-tight mb-4">
              Everything to <span className="grad-text">succeed</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">A complete recruitment ecosystem built for the modern workforce.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="glass-card p-7 hover:-translate-y-1 transition-transform duration-300 group">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${colorMap[f.color]} group-hover:scale-110 transition-transform`}>
                  <f.icon size={22} />
                </div>
                <h3 className="text-lg font-black text-white mb-2 font-head">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section className="py-24 px-6 border-t border-blue-500/10" id="how-it-works">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-chip">Simple Process</div>
            <h2 className="text-4xl font-black font-head text-white mb-4">Get hired in <span className="grad-text">3 steps</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n:'01', icon:Users,       color:'blue',   title:'Build Profile',  desc:'Add skills, education, projects, and resume. Match % auto-calculated for every job.' },
              { n:'02', icon:Search,      color:'purple', title:'Discover & Apply', desc:'Browse smart recommendations sorted by your match score. Apply in one click.' },
              { n:'03', icon:CheckCircle2,color:'green',  title:'Get Hired',      desc:'Track application stages in real-time and land your dream startup role.' },
            ].map((s, i) => (
              <motion.div key={s.n} variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="glass-card p-8 text-center hover:-translate-y-1 transition-transform duration-300">
                <div className="text-5xl font-black text-blue-500/10 font-head mb-3 -mb-2">{s.n}</div>
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mx-auto mb-5 ${colorMap[s.color]}`}>
                  <s.icon size={22} />
                </div>
                <h3 className="text-xl font-black text-white font-head mb-3">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ══════════════════════════════════════════════════ */}
      <section className="py-24 px-6 border-t border-blue-500/10" id="testimonials">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-chip">Success Stories</div>
            <h2 className="text-4xl font-black font-head text-white mb-4">Loved by <span className="grad-text">our community</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`glass-card p-7 hover:-translate-y-1 transition-transform duration-300 ${i===1 ? 'border-blue-500/30 shadow-blue-500/10 shadow-xl' : ''}`}>
                <div className="text-yellow-400 mb-4 text-sm tracking-widest">★★★★★</div>
                <p className="text-slate-300 italic text-sm leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.grad} flex items-center justify-center text-white font-black text-sm`}>{t.avatar}</div>
                  <div>
                    <div className="text-sm font-bold text-white">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 relative border-t border-blue-500/10">
        <div className="orb w-96 h-96 bg-blue-500/10   top-0   left-0" />
        <div className="orb w-72 h-72 bg-purple-500/8  bottom-0 right-0" />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black font-head text-white mb-4 leading-tight">
            Ready to <span className="grad-text">launch your career?</span>
          </h2>
          <p className="text-slate-400 text-lg mb-10">Join 50,000+ freshers and 2,500+ startups building the future together.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/auth?tab=register" className="btn-primary text-base px-10 py-4">Get Started — It's Free</Link>
            <Link to="/auth"              className="btn-secondary text-base px-10 py-4">Sign In</Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ════════════════════════════════════════════════════════ */}
      <footer className="border-t border-blue-500/10 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/25 rounded-xl flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M2 17l10 5 10-5" stroke="#8B5CF6" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-black text-white">Career<span className="text-blue-400">Pilot</span></span>
          </div>
          <p className="text-slate-600 text-sm text-center">© 2026 CareerPilot. Connecting Freshers with Innovative Startups.</p>
          <div className="flex gap-6 text-sm text-slate-600">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
