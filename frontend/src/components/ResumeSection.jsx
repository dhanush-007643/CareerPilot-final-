// ═══════════════════════════════════════════════════════════════════════════
// ResumeSection — Fresher profile resume management component
// Handles: drag-drop upload, view, download, replace, delete
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Download, Trash2, RefreshCw,
  Eye, Loader2, CheckCircle, AlertCircle, CloudUpload,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  uploadResume,
  getResume,
  deleteResume,
  getDownloadUrl,
} from '../services/resumeApi';

// ── Helpers ────────────────────────────────────────────────────────────────

/** Format bytes to human-readable size */
const formatBytes = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/** Format ISO date to readable string */
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

// ── Component ──────────────────────────────────────────────────────────────

export default function ResumeSection() {
  const { user, updateUser } = useAuth();

  // Resume data from API
  const [resume,      setResume]      = useState(null);
  // Loading states
  const [fetching,    setFetching]    = useState(true);
  const [uploading,   setUploading]   = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [downloading, setDownloading] = useState(false);
  // Upload progress (0-100)
  const [progress,    setProgress]    = useState(0);
  // Drag-over visual state
  const [isDragOver,  setIsDragOver]  = useState(false);

  const fileInputRef = useRef(null);

  // ── Fetch resume on mount ────────────────────────────────────────────────
  const fetchResume = useCallback(async () => {
    try {
      const res = await getResume(user._id);
      if (res.success) setResume(res.data);
    } catch {
      // 404 means no resume yet — that's fine
      setResume(null);
    } finally {
      setFetching(false);
    }
  }, [user._id]);

  useEffect(() => { fetchResume(); }, [fetchResume]);

  // ── Validate and upload ──────────────────────────────────────────────────
  const handleUpload = async (file) => {
    // Client-side validation before sending to server
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 5MB.');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const res = await uploadResume(file, setProgress);
      if (res.success) {
        const newResume = res.data.resume || res.data;
        setResume(newResume);
        if (res.data.profileCompletion !== undefined) {
          updateUser({ profileCompletion: res.data.profileCompletion });
        }
        toast.success('Resume uploaded successfully! 🎉');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed. Please try again.';
      toast.error(msg);
    } finally {
      setUploading(false);
      setProgress(0);
      // Clear file input so re-selecting same file works
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── File input change ────────────────────────────────────────────────────
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  // ── Drag-and-drop handlers ───────────────────────────────────────────────
  const onDragOver  = (e) => { e.preventDefault(); setIsDragOver(true);  };
  const onDragLeave = ()  => setIsDragOver(false);
  const onDrop      = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm('Delete your resume? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await deleteResume(user._id);
      if (res.success) {
        setResume(null);
        if (res.data?.profileCompletion !== undefined) {
          updateUser({ profileCompletion: res.data.profileCompletion });
        }
        toast.success('Resume deleted.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Download via pre-signed URL ──────────────────────────────────────────
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await getDownloadUrl(user._id);
      if (res.success) {
        // Open in new tab — triggers browser download
        window.open(res.data.downloadUrl, '_blank', 'noopener,noreferrer');
        toast.success('Download started!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed.');
    } finally {
      setDownloading(false);
    }
  };

  // ── View in browser ──────────────────────────────────────────────────────
  const handleView = () => {
    if (resume?.s3Url) {
      window.open(resume.s3Url, '_blank', 'noopener,noreferrer');
    }
  };

  // ── Replace — triggers file input again ─────────────────────────────────
  const handleReplace = () => fileInputRef.current?.click();

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  // Loading skeleton
  if (fetching) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-5 w-32 bg-white/10 rounded mb-4" />
        <div className="h-24 bg-white/5 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
          <FileText size={18} className="text-blue-400" />
        </div>
        <div>
          <h3 className="font-black text-white text-base">Resume</h3>
          <p className="text-xs text-slate-500">PDF only · max 5 MB</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── NO RESUME: Upload area ───────────────────────────────────── */}
        {!resume && !uploading && (
          <motion.div
            key="upload-area"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-2xl p-10
                flex flex-col items-center justify-center gap-3
                cursor-pointer transition-all duration-200
                ${isDragOver
                  ? 'border-blue-400 bg-blue-500/10 scale-[1.01]'
                  : 'border-blue-500/25 hover:border-blue-400/50 hover:bg-blue-500/5'
                }
              `}
            >
              <motion.div
                animate={isDragOver ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"
              >
                <CloudUpload size={28} className="text-blue-400" />
              </motion.div>

              <div className="text-center">
                <p className="font-bold text-white text-sm">
                  {isDragOver ? 'Drop your PDF here' : 'Drag & drop your resume'}
                </p>
                <p className="text-xs text-slate-500 mt-1">or click to browse · PDF only · max 5MB</p>
              </div>

              {/* Browse button */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/15 border border-blue-500/30 rounded-xl text-blue-400 font-bold text-sm hover:bg-blue-500/25 transition-all"
              >
                <Upload size={15} /> Browse Files
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ── UPLOADING: Progress bar ──────────────────────────────────── */}
        {uploading && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border border-blue-500/20 rounded-2xl p-8 flex flex-col items-center gap-4 bg-blue-500/4"
          >
            <Loader2 size={32} className="text-blue-400 animate-spin" />
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Uploading to S3…</span>
                <span className="font-bold text-blue-400">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'linear' }}
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">Please wait — uploading your PDF…</p>
          </motion.div>
        )}

        {/* ── RESUME EXISTS: Info + action buttons ────────────────────── */}
        {resume && !uploading && (
          <motion.div
            key="resume-card"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="border border-green-500/20 bg-green-500/4 rounded-2xl p-5"
          >
            {/* File info row */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <FileText size={22} className="text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-black text-white text-sm truncate max-w-[200px]">
                    {resume.originalName}
                  </p>
                  <span className="badge-green flex items-center gap-1 text-[10px]">
                    <CheckCircle size={10} /> Uploaded
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-500">
                    {formatBytes(resume.fileSize)}
                  </span>
                  <span className="text-slate-700">·</span>
                  <span className="text-xs text-slate-500">
                    {formatDate(resume.uploadedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* View */}
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleView}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-all"
              >
                <Eye size={14} /> View
              </motion.button>

              {/* Download */}
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 text-xs font-bold hover:bg-purple-500/20 transition-all disabled:opacity-50"
              >
                {downloading
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Download size={14} />
                }
                {downloading ? 'Getting…' : 'Download'}
              </motion.button>

              {/* Replace */}
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleReplace}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-all"
              >
                <RefreshCw size={14} /> Replace
              </motion.button>

              {/* Delete */}
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all disabled:opacity-50"
              >
                {deleting
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Trash2 size={14} />
                }
                {deleting ? 'Deleting…' : 'Delete'}
              </motion.button>
            </div>

            {/* Auto-attach notice */}
            <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-blue-500/6 border border-blue-500/12">
              <AlertCircle size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-400 leading-relaxed">
                This resume will be <span className="text-blue-400 font-bold">automatically attached</span> when
                you apply for jobs.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={onFileChange}
        className="hidden"
        aria-label="Upload resume PDF"
      />
    </div>
  );
}
