// ═══════════════════════════════════════════════════════════════════════════
// Resume Model — Stores S3 URL + metadata for each user's resume
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

  // S3 object key (path inside the bucket)
  s3Key: {
    type: String,
    required: true,
  },

  // Full S3 URL for reference
  s3Url: {
    type: String,
    required: true,
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
