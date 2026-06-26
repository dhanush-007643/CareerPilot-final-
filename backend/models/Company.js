// ═══════════════════════════════════════════════════════════════════════════
// Company Model — Stores company profile data for startups
// ═══════════════════════════════════════════════════════════════════════════

const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  // The startup user who owns this company profile
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  
  name: {
    type: String,
    required: true,
    trim: true,
  },
  
  logoUrl: {
    type: String,
  },
  
  description: {
    type: String,
    maxlength: 2000,
  },
  
  industry: {
    type: String,
    trim: true,
  },
  
  location: {
    type: String,
    trim: true,
  },
  
  websiteUrl: {
    type: String,
    trim: true,
  },
  
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  },
  
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  followRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],

  coverImage: {
    type: String,
  },

  gallery: [{
    type: String,
  }],

}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
