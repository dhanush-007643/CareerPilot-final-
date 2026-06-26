const multer = require('multer');
const path   = require('path');
const { isCloudinaryConfigured, uploadToCloudinary } = require('../config/cloudinary');

// ═══════════════════════════════════════════════════════════════════════════
// Local Disk Storage (development / fallback)
// ═══════════════════════════════════════════════════════════════════════════

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter — allow images, PDFs, and docs
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extOk   = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk  = allowed.test(file.mimetype);
  if (extOk && mimeOk) cb(null, true);
  else cb(new Error('Only images, PDFs, and documents are allowed'), false);
};

// ═══════════════════════════════════════════════════════════════════════════
// Auto-select storage: Cloudinary (memory) when configured, else disk
// ═══════════════════════════════════════════════════════════════════════════

const activeStorage = isCloudinaryConfigured()
  ? multer.memoryStorage()
  : storage;

const upload = multer({
  storage: activeStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

// Preset middlewares
exports.uploadResume   = upload.single('resume');
exports.uploadAvatar   = upload.single('avatar');
exports.uploadLogo     = upload.single('logo');
exports.uploadMultiple = upload.array('files', 5);

// ═══════════════════════════════════════════════════════════════════════════
// Cloudinary Upload Middleware
// Attaches `req.cloudinaryUrl` after uploading the file buffer
// ═══════════════════════════════════════════════════════════════════════════

/**
 * After multer processes the file into memory, upload it to Cloudinary.
 * Falls back to local URL if Cloudinary is not configured.
 */
exports.processCloudinaryUpload = (folder) => async (req, res, next) => {
  if (!req.file) return next();

  if (isCloudinaryConfigured() && req.file.buffer) {
    try {
      const result = await uploadToCloudinary(req.file.buffer, folder);
      req.cloudinaryUrl = result.url;
      req.cloudinaryPublicId = result.publicId;
    } catch (err) {
      console.error('❌ Cloudinary upload error:', err.message);
      return res.status(500).json({ success: false, message: 'File upload failed' });
    }
  } else {
    // Local disk — return relative URL
    req.cloudinaryUrl = `/uploads/${req.file.filename}`;
  }
  next();
};

// ═══════════════════════════════════════════════════════════════════════════
// PDF-Only Memory Storage — used for S3 uploads (buffer stays in memory)
// ═══════════════════════════════════════════════════════════════════════════

// Strict PDF-only filter with clear error messages
const pdfFilter = (req, file, cb) => {
  const ext  = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (ext !== '.pdf' || mime !== 'application/pdf') {
    return cb(new Error('Only PDF files are accepted. Please upload a .pdf file.'), false);
  }
  cb(null, true);
};

// Memory storage — keeps file in buffer for direct S3/Cloudinary upload (no temp file)
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: pdfFilter,
});

// Middleware that handles the upload + catches Multer errors with clean messages
exports.uploadResumePdf = (req, res, next) => {
  memoryUpload.single('resume')(req, res, (err) => {
    if (err) {
      // Multer-specific errors (file too large, wrong type, etc.)
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed.',
      });
    }
    next();
  });
};
