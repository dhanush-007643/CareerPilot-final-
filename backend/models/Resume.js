// ═══════════════════════════════════════════════════════════════════════════
// Resume Model — Stores resume URL + metadata for each user's resume
// Supports both Cloudinary and S3 storage backends
// ═══════════════════════════════════════════════════════════════════════════

const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  // Reference to the user who owns this resume
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // One resume per user
  },

  // Original filename uploaded by the user
  originalName: {
    type: String,
    required: true,
    trim: true,
  },

  // S3 object key (path inside the bucket) — used when S3 is the backend
  s3Key: {
    type: String,
  },

  // Full S3 URL for reference — used when S3 is the backend
  s3Url: {
    type: String,
  },

  // Cloudinary secure URL — used when Cloudinary is the backend
  cloudinaryUrl: {
    type: String,
  },

  // Cloudinary public ID — used for deletion
  cloudinaryPublicId: {
    type: String,
  },

  // File size in bytes
  fileSize: {
    type: Number,
    required: true,
  },

  // MIME type — always application/pdf
  mimeType: {
    type: String,
    default: 'application/pdf',
  },

  // When the resume was uploaded
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
