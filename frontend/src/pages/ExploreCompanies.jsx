import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Globe, Lock, Loader2, UserPlus, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAllCompanies, followCompany } from '../services/profileApi';

export default function ExploreCompanies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadCompanies = async (q = '') => {
    setLoading(true);
    try {
      const res = await getAllCompanies(q);
      if (res.success) setCompanies(res.data);
    } catch (err) {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      loadCompanies(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleFollow = async (e, companyId, isPrivate, isFollowing, hasRequested) => {
    e.preventDefault(); // Prevent navigating to company profile
    e.stopPropagation();

    if (hasRequested) return; // Prevent multiple requests
    
    // Optimistic UI update
    setCompanies(prev => prev.map(c => {
      if (c.userId !== companyId) return c;
      if (isPrivate && !isFollowing && !hasRequested) {
        return { ...c, hasFollowRequest: true };
      }
      return { 
        ...c, 
        isFollowing: !isFollowing,
        followerCount: isFollowing ? c.followerCount - 1 : c.followerCount + 1
      };
    }));

    try {
      const res = await followCompany(companyId);
      if (res.success) {
        setCompanies(prev => prev.map(c => 
          c.userId === companyId ? {
            ...c,
            isFollowing: res.isFollowing,
            hasFollowRequest: res.hasFollowRequest,
            followerCount: res.followerCount
          } : c
        ));
        toast.success(res.message);
      }
    } catch (err) {
      toast.error('Follow action failed');
      loadCompanies(search); // Revert on failure
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white font-head mb-1">
          Explore <span className="grad-text">Companies</span>
        </h1>
        <p className="text-slate-400">Discover startups, follow them, and get notified about their latest jobs.</p>
      </div>

      {/* Search */}
      <div className="glass-card p-4 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search companies by name, industry, or location..."
            className="w-full pl-12 py-3 bg-[#0D1530]/50 border border-cyan-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-[#0D1530] transition-all" 
          />
        </div>
      </div>

      {loading && companies.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-cyan-400 animate-spin" size={36} />
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <Globe className="text-slate-700 mx-auto mb-4" size={48} />
          <p className="text-slate-400 text-xl font-bold">No companies found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company, i) => (
            <motion.div 
              key={company._id} 
              initial={{ opacity: 0, y: 16 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }}
            >
              <Link 
                to={`/company/${company.userId}`}
                className="glass-card p-6 block h-full flex flex-col hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-cyan-500/30 transition-all duration-300 relative overflow-hidden group"
              >
                {/* Visibility Badge */}
                <div className="absolute top-4 right-4 z-10">
                  {company.visibility === 'private' ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                      <Lock size={10} /> Private
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
                      <Globe size={10} /> Public
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center overflow-hidden flex-shrink-0 relative z-10">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-cyan-400">{company.name?.[0]?.toUpperCase() || 'C'}</span>
                    )}
                  </div>
                  <div className="pt-1 pr-16 min-w-0">
                    <h3 className="text-lg font-black text-white font-head truncate group-hover:text-cyan-400 transition-colors">{company.name}</h3>
                    <p className="text-xs text-gold font-bold truncate">{company.industry || 'Tech Startup'}</p>
                  </div>
                </div>

                <p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-grow">
                  {company.description || 'Building the future of technology.'}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-6 text-xs text-slate-300">
                  <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                    <MapPin size={14} className="text-slate-500" />
                    <span className="truncate">{company.location || 'Global'}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                    <Briefcase size={14} className="text-slate-500" />
                    <span><span className="font-bold text-white">{company.activeJobCount || 0}</span> Jobs</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                  <div className="text-xs font-bold">
                    <span className="text-white">{company.followerCount || 0}</span> <span className="text-slate-500">Followers</span>
                  </div>
                  
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleFollow(e, company.userId, company.visibility === 'private', company.isFollowing, company.hasFollowRequest)}
                    disabled={company.hasFollowRequest}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      company.isFollowing 
                        ? 'bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400' 
                        : company.hasFollowRequest
                        ? 'bg-amber-500/20 text-amber-400 cursor-not-allowed opacity-80'
                        : 'bg-cyan-500 text-[#0A0F1E] hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    }`}
                  >
                    {company.isFollowing ? (
                       <>Following</>
                    ) : company.hasFollowRequest ? (
                       <><Loader2 size={12} className="animate-spin" /> Requested</>
                    ) : (
                       <><UserPlus size={14} /> Follow</>
                    )}
                  </motion.button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
