// ═══════════════════════════════════════════════════════════════════════════
// profileController.js — Handles GET and PUT for fresher profile
// ═══════════════════════════════════════════════════════════════════════════

const User        = require('../models/User');
const Resume      = require('../models/Resume');
const Application = require('../models/Application');
const calculateCompletion = require('../utils/profileCompletion');
const { calculateMatch }  = require('../utils/matchScore');
const { createNotification } = require('./notificationController');
const { sendFollowRequestEmail, sendFollowApprovedEmail } = require('../utils/email');

// ── GET /api/profile/fresher/:userId ─────────────────────────────────────
// Returns the full enriched fresher profile: user doc + resume + applications
exports.getFresherProfile = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select('-password');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  if (user.role !== 'fresher') {
    return res.status(400).json({ success: false, message: 'User is not a fresher' });
  }

  // Fetch resume metadata (may not exist — that's fine)
  const resume = await Resume.findOne({ userId }).catch(() => null);

  // Fetch application history with job details
  const applications = await Application.find({ userId })
    .populate('jobId', 'title company location type salary')
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({
    success: true,
    data: {
      ...user.toObject(),
      resume:          resume   || null,
      applications:    applications,
      profileCompletion: user.profileCompletion,
    },
  });
};

// ── PUT /api/profile/fresher/:userId ──────────────────────────────────────
// Update any fresher profile fields; recalculates completion automatically
exports.updateFresherProfile = async (req, res) => {
  const { userId } = req.params;

  // Security: only allow the user to edit their own profile
  if (userId !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorised to edit this profile' });
  }

  // Whitelist of updatable top-level fields
  const ALLOWED = [
    'name', 'phone', 'headline', 'bio', 'avatarUrl',
    'skills', 'education', 'projects', 'certifications', 'visibility',
    // Legacy
    'college', 'graduationYear', 'cgpa',
  ];

  const updates = {};
  ALLOWED.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No valid fields provided' });
  }

  // Fetch current doc to calculate completion on merged data
  const current = await User.findById(userId);
  if (!current) return res.status(404).json({ success: false, message: 'User not found' });

  const merged = { ...current.toObject(), ...updates };
  updates.profileCompletion = calculateCompletion(merged);

  const updated = await User.findByIdAndUpdate(
    userId,
    updates,
    { new: true, runValidators: true }
  ).select('-password');

  // If skills were updated, recalculate match percentages for existing applications
  if (updates.skills) {
    const apps = await Application.find({ userId }).populate('jobId');
    for (const app of apps) {
      if (app.jobId) {
        const newMatch = calculateMatch(updates.skills, app.jobId.requiredSkills);
        if (newMatch !== app.matchPercentage) {
          app.matchPercentage = newMatch;
          await app.save();
        }
      }
    }
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: updated,
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPANY PROFILE OPERATIONS (STARTUP)
// ═══════════════════════════════════════════════════════════════════════════

const Company = require('../models/Company');
const Job = require('../models/Job');

// ── GET /api/profile/company/:companyId ──────────────────────────────────
// Returns the company profile, active jobs, and recruitment stats.
// Here, companyId is the userId of the startup owner.
exports.getCompanyProfile = async (req, res) => {
  const { companyId } = req.params;

  const user = await User.findById(companyId);
  if (!user || user.role !== 'startup') {
    return res.status(404).json({ success: false, message: 'Startup not found' });
  }

  // 1. Fetch or create company profile
  let company = await Company.findOne({ userId: companyId });
  if (!company) {
    company = await Company.create({
      userId: user._id,
      name: user.companyName,
      contactEmail: user.email,
    });
  }

  // 2. Hide jobs if company is private, and user is neither owner nor approved follower
  let canViewJobs = true;
  if (company.visibility === 'private') {
    if (req.user && req.user.role === 'fresher') {
      const isFollower = company.followers.includes(req.user._id);
      if (!isFollower) canViewJobs = false;
    }
  }

  let jobs = [];
  let stats = { totalApplicants: 0, shortlisted: 0, hired: 0 };

  if (canViewJobs) {
    jobs = await Job.find({ companyId, status: 'Open' }).select('title type createdAt visibility').sort({ createdAt: -1 });
    const jobIds = jobs.map(j => j._id);
    const apps = await Application.find({ jobId: { $in: jobIds } });
    
    stats.totalApplicants = apps.length;
    stats.shortlisted = apps.filter(a => ['Shortlisted', 'Interviewing', 'Selected', 'Hired'].includes(a.status)).length;
    stats.hired = apps.filter(a => a.status === 'Hired').length;
  }

  res.json({
    success: true,
    data: {
      ...company.toObject(),
      followerCount: company.followers.length,
      isFollowing: req.user ? company.followers.includes(req.user._id) : false,
      hasFollowRequest: req.user ? (company.followRequests || []).includes(req.user._id) : false,
      jobs,
      stats,
      canViewJobs,
    },
  });
};

// ── PUT /api/profile/company/:companyId ──────────────────────────────────
// Update company profile fields. Only the owner can update.
exports.updateCompanyProfile = async (req, res) => {
  const { companyId } = req.params;

  if (companyId !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorised to edit this profile' });
  }

  const ALLOWED = ['name', 'description', 'industry', 'location', 'websiteUrl', 'contactEmail', 'visibility', 'logoUrl', 'coverImage', 'gallery'];
  const updates = {};
  ALLOWED.forEach(key => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const company = await Company.findOneAndUpdate(
    { userId: companyId },
    updates,
    { new: true, runValidators: true, upsert: true }
  );

  // Sync companyName and avatarUrl with User model if updated
  const userUpdates = {};
  if (updates.name) userUpdates.companyName = updates.name;
  if (updates.logoUrl) userUpdates.avatarUrl = updates.logoUrl;
  if (Object.keys(userUpdates).length > 0) {
    await User.findByIdAndUpdate(companyId, userUpdates);
  }

  res.json({ success: true, message: 'Company profile updated', data: company });
};

// ── POST /api/profile/company/:companyId/follow ──────────────────────────
// Toggle follow/unfollow for a company.
exports.followCompany = async (req, res) => {
  const { companyId } = req.params;
  const userId = req.user._id;

  let company = await Company.findOne({ userId: companyId });
  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found' });
  }

  const isFollowing = company.followers.includes(userId);
  const hasRequested = company.followRequests?.includes(userId);

  if (company.visibility === 'private') {
    if (isFollowing) {
      // Unfollow
      company.followers.pull(userId);
    } else if (hasRequested) {
      // Cancel request
      company.followRequests.pull(userId);
    } else {
      // Send request
      if (!company.followRequests) company.followRequests = [];
      company.followRequests.push(userId);

      // Notify company of request
      if (req.app.get('io')) {
        req.app.get('io').to(companyId).emit('follow_request', {
          fresherName: req.user.name,
          fresherId: req.user._id,
        });
      }
      createNotification({
        receiver: companyId,
        sender: userId,
        title: 'New Follow Request',
        message: `${req.user.name} has requested to follow your private profile.`,
        type: 'general'
      }).catch(() => {});
      sendFollowRequestEmail({
        to: company.contactEmail || req.user.email, // fallback
        companyName: company.name,
        fresherName: req.user.name
      }).catch(() => {});
    }
  } else {
    // Public company: just toggle follower
    if (isFollowing) {
      company.followers.pull(userId);
    } else {
      company.followers.push(userId);
      // Notify company of new public follower
      if (req.app.get('io')) {
        req.app.get('io').to(companyId).emit('new_follower', {
          fresherName: req.user.name,
          fresherId: req.user._id,
        });
      }
      createNotification({
        receiver: companyId,
        sender: userId,
        title: 'New Follower',
        message: `${req.user.name} is now following your company.`,
        type: 'general'
      }).catch(() => {});
    }
  }

  await company.save();

  res.json({
    success: true,
    message: company.visibility === 'private' && !isFollowing && !hasRequested 
      ? 'Follow request sent' 
      : (isFollowing ? 'Unfollowed successfully' : 'Followed successfully'),
    isFollowing: company.followers.includes(userId),
    hasFollowRequest: company.followRequests?.includes(userId) || false,
    followerCount: company.followers.length,
  });
};

// ── GET /api/profile/company/:companyId/followers ────────────────────────
// Get populated followers and follow requests
exports.getFollowersData = async (req, res) => {
  const { companyId } = req.params;

  if (companyId !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorised' });
  }

  const company = await Company.findOne({ userId: companyId })
    .populate('followers', 'name email avatarUrl skills profileCompletion')
    .populate('followRequests', 'name email avatarUrl skills profileCompletion');

  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found' });
  }

  res.json({
    success: true,
    data: {
      followers: company.followers,
      followRequests: company.followRequests || [],
    }
  });
};

// ── POST /api/profile/company/:companyId/follow-request/:fresherId ────────
// Approve or reject a follow request
exports.respondToFollowRequest = async (req, res) => {
  const { companyId, fresherId } = req.params;
  const { action } = req.body; // 'approve' or 'reject'

  if (companyId !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorised' });
  }

  const company = await Company.findOne({ userId: companyId });
  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found' });
  }

  if (!company.followRequests.includes(fresherId)) {
    return res.status(400).json({ success: false, message: 'No pending request found' });
  }

  company.followRequests.pull(fresherId);

  if (action === 'approve') {
    if (!company.followers.includes(fresherId)) {
      company.followers.push(fresherId);
    }

    const fresher = await User.findById(fresherId);
    if (fresher) {
      if (req.app.get('io')) {
        req.app.get('io').to(fresherId).emit('follow_approved', {
          companyName: company.name,
        });
      }
      createNotification({
        receiver: fresherId,
        sender: companyId,
        title: 'Follow Request Approved',
        message: `${company.name} has approved your follow request.`,
        type: 'general'
      }).catch(() => {});
      sendFollowApprovedEmail({
        to: fresher.email,
        fresherName: fresher.name,
        companyName: company.name
      }).catch(() => {});
    }
  }

  await company.save();

  res.json({
    success: true,
    message: `Follow request ${action}d successfully.`,
  });
};
