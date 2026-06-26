import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';
import { getCompanyProfile, updateCompanyProfile, followCompany } from '../services/profileApi';

import CompanyHeader from '../components/company/CompanyHeader';
import CompanyAbout from '../components/company/CompanyAbout';
import CompanyDetails from '../components/company/CompanyDetails';
import CompanyJobs from '../components/company/CompanyJobs';
import CompanyStats from '../components/company/CompanyStats';

const section = (delay) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

export default function CompanyProfilePage() {
  const { companyId } = useParams();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  // If no companyId in URL, assume current user is a startup looking at their own profile
  const targetCompanyId = companyId || user?._id;
  const isOwner = user?._id === targetCompanyId;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!targetCompanyId) {
      navigate('/');
      return;
    }
    try {
      const res = await getCompanyProfile(targetCompanyId);
      if (res.success) setProfile(res.data);
    } catch (err) {
      toast.error('Failed to load company profile');
      navigate('/'); // Fallback if private or not found
    } finally {
      setLoading(false);
    }
  }, [targetCompanyId, navigate]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleSave = async (updates) => {
    setSaving(true);
    try {
      const res = await updateCompanyProfile(targetCompanyId, updates);
      if (res.success) {
        setProfile(prev => ({ ...prev, ...res.data }));
        if (isOwner) updateUser({ companyName: res.data.name, avatarUrl: res.data.logoUrl });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleFollow = async () => {
    try {
      const res = await followCompany(targetCompanyId);
      if (res.success) {
        setProfile(prev => ({ 
          ...prev, 
          isFollowing: res.isFollowing,
          hasFollowRequest: res.hasFollowRequest,
          followerCount: res.followerCount
        }));
        toast.success(res.message);
      }
    } catch { toast.error('Failed to update follow status'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={36} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] circuit-bg pt-20 pb-16">
      <div className="orb w-96 h-96 bg-blue-500/8 -top-20 right-0" />
      <div className="orb w-72 h-72 bg-purple-500/6 bottom-0 left-0" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-5">
        <motion.div {...section(0)}>
          <CompanyHeader profile={profile} isOwner={isOwner} onUpdate={handleSave} onFollow={handleFollow} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <motion.div {...section(0.05)}>
              <CompanyAbout profile={profile} isOwner={isOwner} onSave={handleSave} saving={saving} />
            </motion.div>
            <motion.div {...section(0.10)}>
              {profile?.canViewJobs === false ? (
                <div className="glass-card p-6 flex flex-col items-center justify-center text-center h-48 border border-slate-700/50">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                    <Loader2 size={24} className="text-slate-500" />
                  </div>
                  <h3 className="text-white font-bold text-base">Private Jobs</h3>
                  <p className="text-slate-400 text-sm mt-1">You must follow this company and be approved to view their jobs.</p>
                </div>
              ) : (
                <CompanyJobs jobs={profile?.jobs || []} isOwner={isOwner} />
              )}
            </motion.div>
          </div>

          <div className="space-y-5">
            <motion.div {...section(0.08)}>
              <CompanyDetails profile={profile} isOwner={isOwner} onSave={handleSave} saving={saving} />
            </motion.div>
            <motion.div {...section(0.12)}>
              <CompanyStats stats={profile?.stats} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
