// ═══════════════════════════════════════════════════════════════════════════
// Resume Controller — Handles HTTP request/response for resume operations
// Uses Cloudinary as primary storage, falls back to S3 if configured
// ═══════════════════════════════════════════════════════════════════════════

const Resume = require('../models/Resume');
const User   = require('../models/User');
const calculateCompletion = require('../utils/profileCompletion');
const { isCloudinaryConfigured, uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// Conditionally load S3 service (only if AWS is configured)
let s3Service = null;
try {
  s3Service = require('../services/resumeService');
} catch (e) {
  console.log('ℹ️  S3 service not available, using Cloudinary for resumes');
}

const isS3Configured = () =>
  !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET &&
     process.env.AWS_ACCESS_KEY_ID !== 'your_aws_access_key_id');

// ── POST /api/resume/upload ───────────────────────────────────────────────
// Upload a PDF resume to Cloudinary (or S3 fallback) and save metadata
exports.uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded. Please select a PDF file (max 5MB).',
    });
  }

  try {
    let resumeUrl, resumeData;

    // ── Strategy 1: Cloudinary (primary) ──────────────────────────────
    if (isCloudinaryConfigured()) {
      const result = await uploadToCloudinary(req.file.buffer, 'resumes', 'raw');
      resumeUrl = result.url;
      resumeData = {
        userId:            req.user._id,
        originalName:      req.file.originalname,
        cloudinaryUrl:     result.url,
        cloudinaryPublicId: result.publicId,
        s3Key:             '',
        s3Url:             '',
        fileSize:          req.file.size,
        mimeType:          req.file.mimetype,
        uploadedAt:        new Date(),
      };
    }
    // ── Strategy 2: AWS S3 (fallback) ─────────────────────────────────
    else if (isS3Configured() && s3Service) {
      const { s3Key, s3Url } = await s3Service.uploadToS3(req.file, req.user._id.toString());
      resumeUrl = s3Url;
      resumeData = {
        userId:       req.user._id,
        originalName: req.file.originalname,
        s3Key,
        s3Url,
        fileSize:     req.file.size,
        mimeType:     req.file.mimetype,
        uploadedAt:   new Date(),
      };
    }
    // ── No storage configured ─────────────────────────────────────────
    else {
      return res.status(500).json({
        success: false,
        message: 'File storage is not configured. Please set up Cloudinary or AWS S3.',
      });
    }

    // Upsert resume record
    const resume = await Resume.findOneAndUpdate(
      { userId: req.user._id },
      resumeData,
      { upsert: true, new: true, runValidators: true }
    );

    // Update user's resumeUrl and profile completion
    const user = await User.findById(req.user._id);
    user.resumeUrl = resumeUrl;
    user.profileCompletion = calculateCompletion(user);
    await user.save();

    console.log(`📄 Resume uploaded: ${req.file.originalname}`);

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
exports.deleteResume = async (req, res) => {
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
    // Delete from storage
    if (resume.cloudinaryPublicId) {
      await deleteFromCloudinary(resume.cloudinaryPublicId, 'raw');
    } else if (resume.s3Key && isS3Configured() && s3Service) {
      await s3Service.deleteFromS3(resume.s3Key);
    }

    // Delete from MongoDB
    await Resume.deleteOne({ _id: resume._id });

    // Clear user's resumeUrl and recalculate completion
    const user = await User.findById(req.user._id);
    user.resumeUrl = null;
    user.profileCompletion = calculateCompletion(user);
    await user.save();

    console.log(`🗑️  Resume deleted for user ${req.params.userId}`);

    res.json({
      success: true,
      message: 'Resume deleted successfully.',
      data: { profileCompletion: user.profileCompletion },
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
exports.downloadResume = async (req, res) => {
  const resume = await Resume.findOne({ userId: req.params.userId });

  if (!resume) {
    return res.status(404).json({
      success: false,
      message: 'No resume found for this user.',
    });
  }

  try {
    // Cloudinary files have a direct public URL
    if (resume.cloudinaryUrl) {
      return res.json({
        success: true,
        data: {
          downloadUrl: resume.cloudinaryUrl,
          fileName:    resume.originalName,
          expiresIn:   'Never (Cloudinary)',
        },
      });
    }

    // S3 needs a pre-signed URL
    if (resume.s3Key && isS3Configured() && s3Service) {
      const downloadUrl = await s3Service.getPresignedDownloadUrl(resume.s3Key, 900);
      return res.json({
        success: true,
        data: {
          downloadUrl,
          fileName:  resume.originalName,
          expiresIn: '15 minutes',
        },
      });
    }

    res.status(500).json({
      success: false,
      message: 'File storage not configured for download.',
    });
  } catch (err) {
    console.error('❌ Download URL error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate download link.',
    });
  }
};
