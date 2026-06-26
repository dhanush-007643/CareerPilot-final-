import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
  const [params]   = useSearchParams();
  const [tab, setTab]         = useState(params.get('tab') === 'register' ? 'register' : 'login');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'fresher', companyName:'', college:'' });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        const user = await login(form.email, form.password);
        toast.success(`Welcome back, ${user.name}!`);
        navigate(user.role === 'startup' ? '/startup/dashboard' : '/fresher/dashboard');
      } else {
        const user = await register(form);
        toast.success(`Welcome to CareerPilot, ${user.name}!`);
        navigate(user.role === 'startup' ? '/startup/dashboard' : '/fresher/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] circuit-bg flex items-center justify-center px-4 py-20">
      {/* Orbs */}
      <div className="orb w-96 h-96 bg-blue-500/10   top-0 right-0" />
      <div className="orb w-72 h-72 bg-purple-500/10 bottom-0 left-0" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/25 rounded-xl flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M2 17l10 5 10-5" stroke="#8B5CF6" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-2xl font-black text-white">Career<span className="text-blue-400">Pilot</span></span>
          </div>
          <p className="text-slate-400">{tab === 'login' ? 'Welcome back 👋' : 'Start your journey 🚀'}</p>
        </div>

        <div className="glass-card p-8">
          {/* Tab switcher */}
          <div className="flex rounded-xl bg-black/20 p-1 mb-8 border border-white/5">
            {['login', 'register'].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all capitalize ${tab === t ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                {t === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {tab === 'register' && (
                <motion.div key="reg-fields" initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className="space-y-4 overflow-hidden">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Alex Mercer" required className="cp-input" />
                  </div>

                  {/* Role selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">I am a</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[{v:'fresher', label:'🎓 Fresher / Student'}, {v:'startup', label:'🏢 Startup / Company'}].map((r) => (
                        <button key={r.v} type="button" onClick={() => setForm(p => ({...p, role: r.v}))}
                          className={`py-3 rounded-xl text-sm font-bold border transition-all ${form.role === r.v ? 'bg-blue-500/15 border-blue-500/40 text-blue-300' : 'border-white/10 text-slate-400 hover:border-white/20'}`}>
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {form.role === 'startup' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Company Name</label>
                      <input name="companyName" value={form.companyName} onChange={handleChange} placeholder="TechNova Labs" className="cp-input" />
                    </div>
                  )}
                  {form.role === 'fresher' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">College / University</label>
                      <input name="college" value={form.college} onChange={handleChange} placeholder="IIT Delhi" className="cp-input" />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required className="cp-input" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input name="password" type={showPwd ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="••••••••" required minLength={6} className="cp-input pr-12" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 text-base mt-2 disabled:opacity-60">
              {loading ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Demo creds */}
          <div className="mt-6 p-4 bg-black/20 rounded-xl border border-white/5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-slate-400">
              <p>🎓 Fresher: <span className="text-blue-400">alex@demo.com</span> / password123</p>
              <p>🏢 Startup: <span className="text-purple-400">sarah@demo.com</span> / password123</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
