import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#0A0F1E] flex flex-col items-center justify-center z-50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/25 rounded-xl flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M2 17l10 5 10-5" stroke="#8B5CF6" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M2 12l10 5 10-5" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round" opacity="0.6"/>
          </svg>
        </div>
        <span className="text-xl font-black text-white font-head">Career<span className="text-blue-400">Pilot</span></span>
      </div>
      <Loader2 className="text-blue-400 animate-spin" size={28} />
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-4">Loading...</p>
    </div>
  );
}
