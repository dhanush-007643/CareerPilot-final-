import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Check, X, Loader2, Send, UserMinus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { removeFollower } from '../services/profileApi';
import { useAuth } from '../context/AuthContext';

export default function StartupFollowers() {
  const { user } = useAuth();
  const [followers, setFollowers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedFresher, setSelectedFresher] = useState(null);
  const [selectedJob, setSelectedJob] = useState('');
  const [inviting, setInviting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [followersRes, jobsRes] = await Promise.all([
        api.get(`/profile/company/${user._id}/followers`),
        api.get('/jobs/my')
      ]);
      setFollowers(followersRes.data.data.followers);
      setRequests(followersRes.data.data.followRequests);
      setJobs(jobsRes.data.data.filter(j => j.status === 'Open'));
    } catch (err) {
      toast.error('Failed to load followers');
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRequest = async (fresherId, action) => {
    try {
      await api.post(`/profile/company/${user._id}/follow-request/${fresherId}`, { action });
      toast.success(`Request ${action}d!`);
      loadData();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleRemove = async (followerId) => {
    if (!window.confirm('Remove this follower?')) return;
    try {
      await removeFollower(user._id, followerId);
      toast.success('Follower removed');
      loadData();
    } catch (err) {
      toast.error('Failed to remove follower');
    }
  };

  const openInviteModal = (fresher) => {
    setSelectedFresher(fresher);
    setSelectedJob('');
    setInviteModalOpen(true);
  };

  const handleInvite = async () => {
    if (!selectedJob) return toast.error('Please select a job');
    setInviting(true);
    try {
      await api.post('/applications/invite', { jobId: selectedJob, fresherId: selectedFresher._id });
      toast.success('Invitation sent successfully!');
      setInviteModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={36} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] circuit-bg pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Users className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white font-head">Network & <span className="grad-text">Followers</span></h1>
            <p className="text-slate-400">Manage follow requests and invite candidates to apply.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-6 flex items-center justify-between border-cyan-500/20">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Followers</p>
              <p className="text-3xl font-black text-white">{followers.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Users size={24} />
            </div>
          </div>
          <div className="glass-card p-6 flex items-center justify-between border-amber-500/20">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Requests</p>
              <p className="text-3xl font-black text-white">{requests.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Check size={24} />
            </div>
          </div>
        </div>

        {/* Requests Section */}
        {requests.length > 0 && (
          <div className="glass-card p-6 border-amber-500/20">
            <h2 className="text-lg font-bold text-white mb-4">Pending Follow Requests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {requests.map(req => (
                <div key={req._id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <img src={req.avatarUrl || 'https://via.placeholder.com/40'} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-white text-sm">{req.name}</p>
                      <p className="text-xs text-slate-400">{req.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button onClick={() => handleRequest(req._id, 'approve')} className="flex-1 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-xs font-bold transition-all">Approve</button>
                    <button onClick={() => handleRequest(req._id, 'reject')} className="flex-1 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-bold transition-all">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Followers Section */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-white mb-4">Approved Followers ({followers.length})</h2>
          {followers.length === 0 ? (
            <p className="text-slate-400 text-sm">No followers yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {followers.map(follower => (
                <div key={follower._id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <img src={follower.avatarUrl || 'https://via.placeholder.com/40'} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-white text-sm">{follower.name}</p>
                      <p className="text-xs text-slate-400 line-clamp-1">{follower.skills?.join(', ') || 'No skills listed'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button onClick={() => openInviteModal(follower)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-xs font-bold transition-all">
                      <Send size={14} /> Invite
                    </button>
                    <button onClick={() => handleRemove(follower._id)} className="flex items-center justify-center w-10 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all" title="Remove Follower">
                      <UserMinus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0A0F1E] border border-blue-500/20 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setInviteModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20}/></button>
            <h2 className="text-xl font-bold text-white mb-2">Invite Candidate</h2>
            <p className="text-sm text-slate-400 mb-6">Invite <span className="text-blue-400 font-semibold">{selectedFresher?.name}</span> to apply for one of your open roles.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Select Job</label>
                <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 transition-colors">
                  <option value="">-- Choose an open job --</option>
                  {jobs.map(j => (
                    <option key={j._id} value={j._id}>{j.title} ({j.type})</option>
                  ))}
                </select>
              </div>
              
              <button onClick={handleInvite} disabled={inviting} className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all disabled:opacity-70 flex justify-center items-center gap-2">
                {inviting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Send Invitation
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
