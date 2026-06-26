const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title:          { type: String, required: true },
  description:    { type: String, required: true },
  company:        String,
  companyId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location:       String,
  type:           { type: String, enum: ['Full-time', 'Part-time', 'Internship', 'Remote'], default: 'Full-time' },
  domain:         String,
  salary:         String,
  experience:     { type: String, default: 'Fresher' },
  requiredSkills: [String],
  perks:          [String],
  status:         { type: String, enum: ['Open', 'Closed', 'Draft'], default: 'Open' },
  visibility:     { type: String, enum: ['public', 'private', 'invite_only'], default: 'public' },
  deadline:       Date,
  applicants:     [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
