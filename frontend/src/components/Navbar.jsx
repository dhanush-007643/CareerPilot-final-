import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Briefcase, Menu, X, MessageSquare, Globe } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, isAuth, logout } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const dashPath = user?.role === 'startup' ? '/startup/dashboard' : '/fresher/dashboard';
  const isLanding = location.pathname === '/';

  if (location.pathname === '/auth') return null;

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled || !isLanding ? 'bg-[#0A0F1E]/90 backdrop-blur-xl border-b border-blue-500/10 shadow-lg' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/25 rounded-xl flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5" stroke="#8B5CF6" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 12l10 5 10-5" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round" opacity="0.6"/>
            </svg>
          </div>
          <span className="font-black text-lg text-white font-head">Career<span className="text-blue-400">Pilot</span></span>
        </Link>

        {/* Desktop nav */}
        {!isAuth && (
          <ul className="hidden md:flex items-center gap-1 flex-1">
            {['#features', '#how-it-works', '#pricing'].map((href) => (
              <li key={href}>
                <a href={href} className="px-3 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all capitalize">
                  {href.replace('#', '').replace('-', ' ')}
                </a>
              </li>
            ))}
          </ul>
        )}

        {isAuth && (
          <div className="hidden md:flex items-center gap-1 flex-1">
            <Link to={dashPath} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">
              <LayoutDashboard size={15} /> Dashboard
            </Link>
            {user?.role === 'fresher' && <>
              <Link to="/companies"            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"><Globe size={15}/> Companies</Link>
              <Link to="/fresher/jobs"         className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"><Briefcase size={15}/> Jobs</Link>
              <Link to="/fresher/applications" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">My Applications</Link>
              <Link to="/fresher/arena"        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">Training Arena</Link>
              <Link to="/fresher/profile"      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">Profile</Link>
              <Link to="/fresher/resume"       className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">Resume</Link>
              <Link to="/chat"                 className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"><MessageSquare size={15}/> Chat</Link>
            </>}
            {user?.role === 'startup' && <>
              <Link to="/companies"        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"><Globe size={15}/> Explore</Link>
              <Link to="/startup/jobs"     className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"><Briefcase size={15}/> My Jobs</Link>
              <Link to="/startup/post-job" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">Post Job</Link>
              <Link to="/startup/followers" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">Followers</Link>
              <Link to="/startup/profile"  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">Profile</Link>
              <Link to="/chat"             className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"><MessageSquare size={15}/> Chat</Link>
            </>}
          </div>
        )}

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {isAuth ? (
            <>
              <NotificationBell />
              <div className="hidden md:flex items-center gap-2 px-3 py-2 glass-card text-sm font-semibold text-slate-300">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-black">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                {user?.name?.split(' ')[0]}
                <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${user?.role === 'startup' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {user?.role}
                </span>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                <LogOut size={16} /> <span className="hidden md:block">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="hidden md:block px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">Sign In</Link>
              <Link to="/auth?tab=register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
            </>
          )}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-slate-400 hover:text-white">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#0A0F1E]/98 border-t border-blue-500/10 px-6 py-4 flex flex-col gap-2">
          {isAuth ? (
            <>
              <Link to={dashPath}           className="py-2.5 text-sm font-semibold text-slate-300" onClick={() => setOpen(false)}>Dashboard</Link>
              {user?.role === 'fresher' && <>
                <Link to="/companies"            className="py-2.5 text-sm font-semibold text-slate-300" onClick={() => setOpen(false)}>Companies</Link>
                <Link to="/fresher/jobs"         className="py-2.5 text-sm font-semibold text-slate-300" onClick={() => setOpen(false)}>Browse Jobs</Link>
                <Link to="/fresher/applications" className="py-2.5 text-sm font-semibold text-slate-300" onClick={() => setOpen(false)}>My Applications</Link>
                <Link to="/fresher/arena"        className="py-2.5 text-sm font-semibold text-slate-300" onClick={() => setOpen(false)}>Training Arena</Link>
                <Link to="/fresher/profile"      className="py-2.5 text-sm font-semibold text-slate-300" onClick={() => setOpen(false)}>Profile</Link>
                <Link to="/fresher/resume"       className="py-2.5 text-sm font-semibold text-slate-300" onClick={() => setOpen(false)}>Resume</Link>
              </>}
              {user?.role === 'startup' && <>
                <Link to="/companies"        className="py-2.5 text-sm font-semibold text-slate-300" onClick={() => setOpen(false)}>Explore Companies</Link>
                <Link to="/startup/jobs"     className="py-2.5 text-sm font-semibold text-slate-300" onClick={() => setOpen(false)}>My Jobs</Link>
                <Link to="/startup/post-job" className="py-2.5 text-sm font-semibold text-slate-300" onClick={() => setOpen(false)}>Post Job</Link>
                <Link to="/startup/followers" className="py-2.5 text-sm font-semibold text-slate-300" onClick={() => setOpen(false)}>Followers</Link>
                <Link to="/startup/profile"  className="py-2.5 text-sm font-semibold text-slate-300" onClick={() => setOpen(false)}>Profile</Link>
              </>}
              <button onClick={() => { handleLogout(); setOpen(false); }} className="py-2.5 text-sm font-semibold text-red-400 text-left">Logout</button>
            </>
          ) : (
            <>
              <Link to="/auth"              className="py-2.5 text-sm font-semibold text-slate-300" onClick={() => setOpen(false)}>Sign In</Link>
              <Link to="/auth?tab=register" className="py-2.5 text-sm font-semibold text-blue-400"  onClick={() => setOpen(false)}>Get Started Free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
