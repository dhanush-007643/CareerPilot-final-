// ═══════════════════════════════════════════════════════════════════════════
// Profile Routes — JWT protected
// ═══════════════════════════════════════════════════════════════════════════

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  getFresherProfile,
  updateFresherProfile,
} = require('../controllers/profileController');

// GET  /api/profile/fresher/:userId — fetch full profile + resume + applications
router.get('/fresher/:userId', protect, getFresherProfile);

// PUT  /api/profile/fresher/:userId — update profile fields
router.put('/fresher/:userId', protect, updateFresherProfile);

// ── COMPANY PROFILE ROUTES ───────────────────────────────────────────────
const {
  getCompanyProfile,
  updateCompanyProfile,
  followCompany,
  getFollowersData,
  respondToFollowRequest,
} = require('../controllers/profileController');

// GET  /api/profile/company/:companyId — fetch company profile + stats + jobs
// Can be public (e.g. for freshers), but we use `protect` so we can check `req.user`
router.get('/company/:companyId', protect, getCompanyProfile);

// PUT  /api/profile/company/:companyId — update company profile
router.put('/company/:companyId', protect, updateCompanyProfile);

// POST /api/profile/company/:companyId/follow — follow/unfollow company
router.post('/company/:companyId/follow', protect, followCompany);

// GET  /api/profile/company/:companyId/followers — get followers & requests
router.get('/company/:companyId/followers', protect, getFollowersData);

const { removeFollower } = require('../controllers/companyController');

// POST /api/profile/company/:companyId/follow-request/:fresherId — approve/reject
router.post('/company/:companyId/follow-request/:fresherId', protect, respondToFollowRequest);

// DELETE /api/profile/company/:companyId/followers/:followerId — remove follower
router.delete('/company/:companyId/followers/:followerId', protect, removeFollower);

module.exports = router;
