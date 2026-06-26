const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role:     { type: String, enum: ['fresher', 'startup', 'admin'], default: 'fresher' },

  // ── Fresher core fields ──────────────────────────────────────────────────
  phone:       { type: String, trim: true },
  headline:    { type: String, trim: true, maxlength: 120 }, // e.g. "Final Year CSE @ VIT"
  bio:         { type: String, maxlength: 500 },
  skills:      [{ type: String, trim: true }],
  avatarUrl:   String,
  resumeUrl:   String,
  visibility:  { type: String, enum: ['public', 'private'], default: 'public' },
  assessmentScore: { type: Number, default: 0 },
  profileCompletion: { type: Number, default: 0, min: 0, max: 100 },

  // ── Education (array — supports multiple degrees) ────────────────────────
  education: [{
    degree:        { type: String, required: true },
    college:       { type: String, required: true },
    fieldOfStudy:  String,
    startYear:     Number,
    endYear:       Number,
    cgpa:          Number,
    current:       { type: Boolean, default: false },
  }],

  // Legacy single college/year fields (kept for backward compat)
  college:       String,
  graduationYear: Number,
  cgpa:          Number,

  // ── Projects ─────────────────────────────────────────────────────────────
  projects: [{
    title:       { type: String, required: true },
    description: String,
    url:         String,       // GitHub / live link
    techStack:   [String],
    year:        Number,
  }],

  // ── Certifications ───────────────────────────────────────────────────────
  certifications: [{
    name:   { type: String, required: true },
    issuer: { type: String, required: true },
    year:   Number,
    url:    String,            // Credential link
  }],

  // ── Startup fields ───────────────────────────────────────────────────────
  companyName:  String,
  companyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  companyRole:  { type: String, enum: ['Admin', 'Member'], default: 'Admin' },

  // ── Common ───────────────────────────────────────────────────────────────
  isActive:  { type: Boolean, default: true },
  lastLogin: Date,
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
