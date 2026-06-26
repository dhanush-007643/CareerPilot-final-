// ═══════════════════════════════════════════════════════════════════════════
// Resume Service — Handles all S3 operations (upload, delete, presigned URL)
// Separated from controller to keep business logic clean and testable
// ═══════════════════════════════════════════════════════════════════════════

const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, BUCKET_NAME } = require('../config/s3');
const path = require('path');

/**
 * Upload a file buffer to S3.
 * @param {Object} file - Multer file object (buffer, originalname, mimetype)
 * @param {string} userId - The user's MongoDB _id
 * @returns {{ s3Key: string, s3Url: string }} - The stored key and public URL
 */
const uploadToS3 = async (file, userId) => {
  // Generate a unique S3 key: resumes/<userId>/<timestamp>-<filename>.pdf
  const ext      = path.extname(file.originalname).toLowerCase();
  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const s3Key    = `resumes/${userId}/${Date.now()}-${safeName}`;

  // Build the PutObject command
  const command = new PutObjectCommand({
    Bucket:      BUCKET_NAME,
    Key:         s3Key,
    Body:        file.buffer,
    ContentType: file.mimetype || 'application/pdf',
    // Metadata for traceability
    Metadata: {
      userId:       userId,
      originalName: file.originalname,
    },
  });

  // Execute the upload
  await s3Client.send(command);

  // Construct the public URL
  const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${s3Key}`;

  return { s3Key, s3Url };
};

/**
 * Delete an object from S3 by its key.
 * @param {string} s3Key - The S3 object key to delete
 */
const deleteFromS3 = async (s3Key) => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key:    s3Key,
  });
  await s3Client.send(command);
};

/**
 * Generate a pre-signed URL for secure, time-limited download.
 * @param {string} s3Key - The S3 object key
 * @param {number} expiresIn - URL validity in seconds (default: 15 minutes)
 * @returns {string} - Pre-signed download URL
 */
const getPresignedDownloadUrl = async (s3Key, expiresIn = 900) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key:    s3Key,
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
};

module.exports = { uploadToS3, deleteFromS3, getPresignedDownloadUrl };
