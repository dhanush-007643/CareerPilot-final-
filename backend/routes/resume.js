// ═══════════════════════════════════════════════════════════════════════════
// Resume Routes — All protected with JWT authentication
// ═══════════════════════════════════════════════════════════════════════════

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { uploadResumePdf } = require('../middleware/upload');
const {
  uploadResume,
  getResume,
  deleteResume,
  downloadResume,
} = require('../controllers/resumeController');

// ── POST /api/resume/upload ─────────────────────────────────────────────
// Upload PDF resume (PDF-only Multer memory storage → S3)
router.post('/upload', protect, uploadResumePdf, uploadResume);

// ── GET /api/resume/download/:userId ────────────────────────────────────
// IMPORTANT: Must be registered BEFORE /:userId to avoid param collision
// Returns a pre-signed S3 URL valid for 15 minutes
router.get('/download/:userId', protect, downloadResume);

// ── GET /api/resume/:userId ─────────────────────────────────────────────
// Fetch resume metadata for a user
router.get('/:userId', protect, getResume);

// ── DELETE /api/resume/:userId ──────────────────────────────────────────
// Remove resume from both S3 and MongoDB
router.delete('/:userId', protect, deleteResume);

module.exports = router;
