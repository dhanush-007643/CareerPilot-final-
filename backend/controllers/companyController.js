// ═══════════════════════════════════════════════════════════════════════════
// companyController.js — Handles Explore Companies & follower management
// ═══════════════════════════════════════════════════════════════════════════

const Company = require('../models/Company');
const Job     = require('../models/Job');
const User    = require('../models/User');
const { createNotification } = require('./notificationController');

// ── GET /api/companies ──────────────────────────────────────────────────
// List all companies with follower count, active job count, and follow status.
// Supports optional ?search= query parameter.
exports.getAllCompanies = async (req, res) => {
  const { search } = req.query;
  const userId = req.user?._id;

  // Build filter
  const filter = {};
  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { name: regex },
      { industry: regex },
      { location: regex },
      { description: regex },
    ];
  }

  // Fetch all company profiles
  const companies = await Company.find(filter)
    .select('name logoUrl description industry location websiteUrl visibility followers followRequests userId coverImage')
    .sort({ createdAt: -1 });

  // Get active job counts for all companies in a single aggregation
  const jobCounts = await Job.aggregate([
    { $match: { status: 'Open' } },
    { $group: { _id: '$companyId', count: { $sum: 1 } } },
  ]);
  const jobCountMap = {};
  jobCounts.forEach(jc => {
    jobCountMap[jc._id.toString()] = jc.count;
  });

  // Build response with computed fields
  const data = companies.map(company => {
    const obj = company.toObject();
    return {
      _id: obj._id,
      userId: obj.userId,
      name: obj.name,
      logoUrl: obj.logoUrl,
      description: obj.description,
      industry: obj.industry,
      location: obj.location,
      websiteUrl: obj.websiteUrl,
      visibility: obj.visibility,
      coverImage: obj.coverImage,
      followerCount: obj.followers?.length || 0,
      activeJobCount: jobCountMap[obj.userId?.toString()] || 0,
      isFollowing: userId ? obj.followers?.some(f => f.toString() === userId.toString()) : false,
      hasFollowRequest: userId ? obj.followRequests?.some(f => f.toString() === userId.toString()) : false,
    };
  });

  res.json({ success: true, count: data.length, data });
};

// ── DELETE /api/profile/company/:companyId/followers/:followerId ─────────
// Remove an existing follower. Only the company owner can do this.
exports.removeFollower = async (req, res) => {
  const { companyId, followerId } = req.params;

  // Only company owner can remove followers
  if (companyId !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorised' });
  }

  const company = await Company.findOne({ userId: companyId });
  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found' });
  }

  if (!company.followers.includes(followerId)) {
    return res.status(400).json({ success: false, message: 'User is not a follower' });
  }

  company.followers.pull(followerId);
  await company.save();

  // Notify the removed follower
  createNotification({
    receiver: followerId,
    sender: companyId,
    title: 'Removed from Followers',
    message: `${company.name} has removed you from their followers list.`,
    type: 'follow_removed',
  }).catch(() => {});

  // Real-time update via Socket.io
  if (req.app.get('io')) {
    req.app.get('io').to(followerId).emit('follow_removed', {
      companyName: company.name,
      companyId: company.userId,
    });
  }

  res.json({
    success: true,
    message: 'Follower removed successfully',
    followerCount: company.followers.length,
  });
};
