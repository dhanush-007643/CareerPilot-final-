// ═══════════════════════════════════════════════════════════════════════════
// FresherProfilePage — Assembles all profile sections
// Route: /fresher/profile (protected, fresher only)
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth }            from '../context/AuthContext';
import { getFresherProfile, updateFresherProfile } from '../services/profileApi';

// Section components
import ProfileHeader        from '../components/profile/ProfileHeader';
import PersonalInfo         from '../components/profile/PersonalInfo';
import SkillsSection        from '../components/profile/SkillsSection';
import EducationSection     from '../components/profile/EducationSection';
import ProjectsSection      from '../components/profile/ProjectsSection';
import CertificationsSection from '../components/profile/CertificationsSection';
import ResumeSection        from '../components/ResumeSection';
import AssessmentBadges     from '../components/profile/AssessmentBadges';
import ApplicationHistory   from '../components/profile/ApplicationHistory';

// Stagger delay for each section on load
const section = (delay) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

export default function FresherProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  // ── Fetch full profile ───────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    try {
      const res = await getFresherProfile(user._id);
      if (res.success) setProfile(res.data);
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // ── Shared save handler — passed to each section ─────────────────────────
  const handleSave = async (updates) => {
    setSaving(true);
    try {
      const res = await updateFresherProfile(user._id, updates);
      if (res.success) {
        setProfile(prev => ({ ...prev, ...res.data }));
        // Sync AuthContext so Navbar stays updated
        updateUser({ name: res.data.name, avatarUrl: res.data.avatarUrl });
        return res.data;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={36} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  // ── Compute avg match from applications ──────────────────────────────────
  const apps = profile?.applications || [];
  const avgMatch = apps.length
    ? Math.round(apps.reduce((s, a) => s + (a.matchPercentage || 0), 0) / apps.length)
    : 0;

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#0A0F1E] circuit-bg pt-20 pb-16">
      {/* Background orbs */}
      <div className="orb w-96 h-96 bg-blue-500/8 -top-20 right-0" />
      <div className="orb w-72 h-72 bg-purple-500/6 bottom-0 left-0" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-5">

        {/* ── Header: avatar + name + progress ─────────────────────────── */}
        <motion.div {...section(0)}>
          <ProfileHeader
            profile={profile}
            onUpdate={(updates) => handleSave(updates)}
          />
        </motion.div>

        {/* ── Two-column layout on desktop ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left column — main sections */}
          <div className="lg:col-span-2 space-y-5">

            <motion.div {...section(0.05)}>
              <PersonalInfo
                profile={profile}
                onSave={handleSave}
                saving={saving}
              />
            </motion.div>

            <motion.div {...section(0.10)}>
              <EducationSection
                education={profile?.education || []}
                onSave={handleSave}
                saving={saving}
              />
            </motion.div>

            <motion.div {...section(0.15)}>
              <ProjectsSection
                projects={profile?.projects || []}
                onSave={handleSave}
                saving={saving}
              />
            </motion.div>

            <motion.div {...section(0.20)}>
              <CertificationsSection
                certifications={profile?.certifications || []}
                onSave={handleSave}
                saving={saving}
              />
            </motion.div>

            <motion.div {...section(0.25)}>
              <ApplicationHistory applications={apps} />
            </motion.div>

          </div>

          {/* Right column — resume + skills + assessment */}
          <div className="space-y-5">

            <motion.div {...section(0.08)}>
              <SkillsSection
                skills={profile?.skills || []}
                onSave={handleSave}
                saving={saving}
              />
            </motion.div>

            <motion.div {...section(0.12)}>
              {/* ResumeSection handles its own API calls */}
              <ResumeSection />
            </motion.div>

            <motion.div {...section(0.18)}>
              <AssessmentBadges
                assessmentScore={profile?.assessmentScore || 0}
                matchScore={avgMatch}
              />
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
