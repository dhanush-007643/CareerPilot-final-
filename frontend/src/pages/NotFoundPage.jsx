import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  const { isAuth, user } = useAuth();
  const dashPath = user?.role === 'startup' ? '/startup/dashboard' : '/fresher/dashboard';

  return (
    <div className="min-h-screen bg-[#0A0F1E] circuit-bg flex items-center justify-center px-6">
      <div className="orb w-96 h-96 bg-blue-500/10 top-0 right-0" />
      <div className="orb w-72 h-72 bg-purple-500/8 bottom-0 left-0" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center max-w-md"
      >
        <div className="text-[120px] font-black text-white/5 font-head leading-none select-none mb-[-20px]">
          404
        </div>
        <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
          <Rocket className="text-blue-400" size={36} />
        </div>
        <h1 className="text-3xl font-black text-white font-head mb-3">
          Page Not Found
        </h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary">
            <Home size={16} /> Back to Home
          </Link>
          {isAuth && (
            <Link to={dashPath} className="btn-secondary">
              Go to Dashboard
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}
