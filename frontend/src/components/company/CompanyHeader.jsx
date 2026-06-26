import React, { useRef, useState } from 'react';
import { Camera, Loader2, MapPin, Globe, ExternalLink, Edit3, UserPlus, Check, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function CompanyHeader({ profile, isOwner, onUpdate, onFollow }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file); // using existing avatar upload endpoint
      const res = await api.post('/upload/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) {
        onUpdate({ logoUrl: res.data.url });
        toast.success('Company logo updated!');
      }
    } catch { toast.error('Logo upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Logo */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden border-2 border-blue-500/30">
            {profile?.logoUrl ? (
              <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-black text-white">{profile?.name?.[0]?.toUpperCase() || 'C'}</span>
            )}
          </div>
          {isOwner && (
            <>
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-400 border-2 border-[#0A0F1E] flex items-center justify-center transition-all">
                {uploading ? <Loader2 size={13} className="animate-spin text-white" /> : <Camera size={13} className="text-white" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
            </>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 w-full text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-white">{profile?.name || 'Company Name'}</h1>
                {profile?.visibility === 'private' ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md mt-1">
                    <Lock size={10} /> Private
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 rounded-md mt-1">
                    <Globe size={10} /> Public
                  </span>
                )}
              </div>
              <p className="text-blue-400 font-semibold text-sm mt-0.5">{profile?.industry || 'Industry not specified'}</p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2 justify-center">
              {!isOwner ? (
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={profile?.hasFollowRequest ? undefined : onFollow} 
                  disabled={profile?.hasFollowRequest}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    profile?.isFollowing ? 'bg-white/10 text-white hover:bg-white/15' : 
                    profile?.hasFollowRequest ? 'bg-amber-500/20 text-amber-400 cursor-not-allowed opacity-80' :
                    'bg-cyan-500 text-[#0A0F1E] hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  }`}
                >
                  {profile?.isFollowing ? <><Check size={16} /> Following</> : 
                   profile?.hasFollowRequest ? <><Loader2 size={16} className="animate-spin" /> Requested</> : 
                   <><UserPlus size={16} /> Follow</>}
                </motion.button>
              ) : (
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/15 transition-all">
                  <Edit3 size={16} /> Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-xs text-slate-400">
            {profile?.location && (
              <span className="flex items-center gap-1"><MapPin size={14} className="text-blue-400"/> {profile.location}</span>
            )}
            {profile?.websiteUrl && (
              <a href={profile.websiteUrl.startsWith('http') ? profile.websiteUrl : `https://${profile.websiteUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                <Globe size={14} className="text-blue-400"/> {profile.websiteUrl.replace(/^https?:\/\//, '')} <ExternalLink size={10} />
              </a>
            )}
            <span className="flex items-center gap-1 ml-auto font-bold text-slate-300">
              <UserPlus size={14} className="text-purple-400"/> {profile?.followerCount || 0} Followers
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
