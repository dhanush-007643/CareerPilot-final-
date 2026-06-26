// ═══════════════════════════════════════════════════════════════════════════
// AWS S3 Client Configuration
// Uses AWS SDK v3 — lightweight, modular, tree-shakeable
// ═══════════════════════════════════════════════════════════════════════════

const { S3Client } = require('@aws-sdk/client-s3');

// Create the S3 client using environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// The S3 bucket where resumes are stored
const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'careerpilot-resumes';

module.exports = { s3Client, BUCKET_NAME };
