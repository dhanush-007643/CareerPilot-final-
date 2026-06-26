// ProfileHeader — avatar, name, headline, completion progress bar
import React, { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

const COLORS = pct =>
  pct >= 80 ? 'from-green-500 to-emerald-400'
  : pct >= 50 ? 'from-blue-500 to-purple-500'
  : 'from-amber-500 to-orange-400';

export default function ProfileHeader({ profile, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const pct = profile?.profileCompletion ?? 0;

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 3 * 1024 * 1024)    { toast.error('Image must be under 3MB'); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await api.post('/upload/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        onUpdate({ avatarUrl: res.data.url });
        toast.success('Profile photo updated!');
      }
    } catch { toast.error('Photo upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden border-2 border-blue-500/30">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-black text-white">
                {profile?.name?.[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-400 border-2 border-[#0A0F1E] flex items-center justify-center transition-all"
          >
            {uploading ? <Loader2 size={13} className="animate-spin text-white" /> : <Camera size={13} className="text-white" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </div>

        {/* Name + headline + completion */}
        <div className="flex-1 w-full text-center sm:text-left">
          <h1 className="text-2xl font-black text-white">{profile?.name || 'Your Name'}</h1>
          <p className="text-blue-400 font-semibold text-sm mt-0.5">
            {profile?.headline || 'Add a headline…'}
          </p>
          <p className="text-slate-500 text-xs mt-1">{profile?.email}</p>

          {/* Completion bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-400">Profile Completion</span>
              <span className={`text-xs font-black ${pct >= 80 ? 'text-green-400' : pct >= 50 ? 'text-blue-400' : 'text-amber-400'}`}>
                {pct}%
              </span>
            </div>
            <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${COLORS(pct)}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            {pct < 100 && (
              <p className="text-[11px] text-slate-600 mt-1">
                {pct < 50 ? 'Add your education, skills, and projects to stand out!' :
                 pct < 80 ? 'Almost there! Add certifications and more projects.' :
                 'Nearly perfect! Upload a resume to reach 100%.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
