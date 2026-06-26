
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
  }

  await company.save();

  res.json({
    success: true,
    message: `Follow request ${action}d successfully.`,
  });
};
