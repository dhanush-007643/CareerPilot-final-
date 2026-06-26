const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Job',  required: true },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Interviewing', 'Selected', 'Rejected', 'Hired', 'Invited'],
    default: 'Applied'
  },
  matchPercentage: { type: Number, default: 0, min: 0, max: 100 },
  coverLetter:     String,
  resumeUrl:       String,
  history:         [{ status: String, changedAt: { type: Date, default: Date.now } }],
  interview: {
    dateTime:  Date,
    format:    String,
    link:      String,
    notes:     String,
  },
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
