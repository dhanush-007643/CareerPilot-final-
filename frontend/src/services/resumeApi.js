// ═══════════════════════════════════════════════════════════════════════════
// Resume API Service — Frontend calls for all resume operations
// ═══════════════════════════════════════════════════════════════════════════

import api from './api';

/**
 * Upload a PDF resume file.
 * Uses multipart/form-data — Axios handles Content-Type automatically.
 * @param {File} file - The PDF File object from the input/drop event
 * @param {Function} onProgress - Optional progress callback (0-100)
 * @returns {Object} - { success, data: resume }
 */
export const uploadResume = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('resume', file);

  const res = await api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });
  return res.data;
};

/**
 * Fetch resume metadata for a user.
 * @param {string} userId
 */
export const getResume = async (userId) => {
  const res = await api.get(`/resume/${userId}`);
  return res.data;
};

/**
 * Delete a user's resume from S3 and MongoDB.
 * @param {string} userId
 */
export const deleteResume = async (userId) => {
  const res = await api.delete(`/resume/${userId}`);
  return res.data;
};

/**
 * Get a pre-signed download URL (valid 15 minutes).
 * @param {string} userId
 */
export const getDownloadUrl = async (userId) => {
  const res = await api.get(`/resume/download/${userId}`);
  return res.data; // { success, data: { downloadUrl, fileName, expiresIn } }
};
