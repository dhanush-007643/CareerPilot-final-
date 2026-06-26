// ═══════════════════════════════════════════════════════════════════════════
// Resume Controller — Handles HTTP request/response for resume operations
// Delegates S3 work to resumeService for clean separation
// ═══════════════════════════════════════════════════════════════════════════

const Resume = require('../models/Resume');
const User   = require('../models/User');
const { uploadToS3, deleteFromS3, getPresignedDownloadUrl } = require('../services/resumeService');
const calculateCompletion = require('../utils/profileCompletion');

// ── POST /api/resume/upload ───────────────────────────────────────────────
// Upload a PDF resume to S3 and save metadata to MongoDB
exports.uploadResume = async (req, res) => {
  // Multer middleware already validated file type and size
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded. Please select a PDF file (max 5MB).',
    });
  }

  try {
    // 1. Upload file buffer to S3
    const { s3Key, s3Url } = await uploadToS3(req.file, req.user._id.toString());

    // 2. Upsert resume record — replaces existing resume if user re-uploads
    const resume = await Resume.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId:       req.user._id,
        originalName: req.file.originalname,
        s3Key,
        s3Url,
        fileSize:     req.file.size,
        mimeType:     req.file.mimetype,
        uploadedAt:   new Date(),
      },
      { upsert: true, new: true, runValidators: true }
    );

    // 3. Update the user's resumeUrl field and recalculate profile completion
    const user = await User.findById(req.user._id);
    user.resumeUrl = s3Url;
    user.profileCompletion = calculateCompletion(user);
    await user.save();

    console.log(`📄 Resume uploaded: ${req.file.originalname} → ${s3Key}`);

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully!',
      data: {
        resume,
        profileCompletion: user.profileCompletion,
      },
    });
  } catch (err) {
    console.error('❌ Resume upload error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to upload resume. Please try again.',
    });
  }
};

// ── GET /api/resume/:userId ───────────────────────────────────────────────
// Fetch resume metadata for a specific user
exports.getResume = async (req, res) => {
  const resume = await Resume.findOne({ userId: req.params.userId });

  if (!resume) {
    return res.status(404).json({
      success: false,
      message: 'No resume found for this user.',
    });
  }

  res.json({ success: true, data: resume });
};

// ── DELETE /api/resume/:userId ────────────────────────────────────────────
// Remove resume from both S3 and MongoDB
exports.deleteResume = async (req, res) => {
  // Only allow users to delete their own resume
  if (req.params.userId !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only delete your own resume.',
    });
  }

  const resume = await Resume.findOne({ userId: req.params.userId });

  if (!resume) {
    return res.status(404).json({
      success: false,
      message: 'No resume found to delete.',
    });
  }

  try {
    // 1. Delete from S3
    await deleteFromS3(resume.s3Key);

    // 2. Delete from MongoDB
    await Resume.deleteOne({ _id: resume._id });

    // 3. Clear the user's resumeUrl field and recalculate profile completion
    const user = await User.findById(req.user._id);
    user.resumeUrl = null;
    user.profileCompletion = calculateCompletion(user);
    await user.save();

    console.log(`🗑️  Resume deleted: ${resume.s3Key}`);

    res.json({
      success: true,
      message: 'Resume deleted successfully.',
      data: {
        profileCompletion: user.profileCompletion,
      },
    });
  } catch (err) {
    console.error('❌ Resume delete error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume. Please try again.',
    });
  }
};

// ── GET /api/resume/download/:userId ──────────────────────────────────────
// Generate a pre-signed S3 URL for secure, time-limited download
exports.downloadResume = async (req, res) => {
  const resume = await Resume.findOne({ userId: req.params.userId });

  if (!resume) {
    return res.status(404).json({
      success: false,
      message: 'No resume found for this user.',
    });
  }

  try {
    // Generate a pre-signed URL valid for 15 minutes
    const downloadUrl = await getPresignedDownloadUrl(resume.s3Key, 900);

    res.json({
      success: true,
      data: {
        downloadUrl,
        fileName:  resume.originalName,
        expiresIn: '15 minutes',
      },
    });
  } catch (err) {
    console.error('❌ Pre-signed URL error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate download link.',
    });
  }
};
