// ═══════════════════════════════════════════════════════════════════════════
// Cloudinary Configuration
// Free tier: 25 GB storage, 25 GB bandwidth/month
// Stores: Resumes, Avatars, Company Logos, Certificates
// ═══════════════════════════════════════════════════════════════════════════

const cloudinary = require('cloudinary').v2;

// Configure from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key:    process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

/**
 * Check if Cloudinary is configured (all three credentials present).
 */
const isCloudinaryConfigured = () =>
  !!(process.env.CLOUDINARY_NAME && process.env.CLOUDINARY_KEY && process.env.CLOUDINARY_SECRET);

/**
 * Upload a file buffer or path to Cloudinary.
 * @param {Buffer|string} file  – File buffer (from multer memory storage) or local path
 * @param {string} folder       – Cloudinary folder (e.g. 'resumes', 'avatars')
 * @param {string} [resourceType='auto'] – 'image', 'raw', or 'auto'
 * @returns {Promise<{url: string, publicId: string}>}
 */
const uploadToCloudinary = async (file, folder, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const options = {
      folder: `careerpilot/${folder}`,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
    };

    // If file is a buffer, use upload_stream
    if (Buffer.isBuffer(file)) {
      const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      });
      uploadStream.end(file);
    } else {
      // file is a local path
      cloudinary.uploader.upload(file, options, (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      });
    }
  });
};

/**
 * Delete a file from Cloudinary by public ID.
 * @param {string} publicId
 * @param {string} [resourceType='image']
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log(`🗑️  Cloudinary: Deleted ${publicId}`);
  } catch (err) {
    console.error('❌ Cloudinary delete error:', err.message);
  }
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary,
};
