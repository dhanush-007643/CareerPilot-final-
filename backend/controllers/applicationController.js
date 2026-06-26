const Application = require('../models/Application');
const Job  = require('../models/Job');
const User = require('../models/User');
const { calculateMatch }  = require('../utils/matchScore');
const { sendStatusEmail, sendInvitationEmail } = require('../utils/email');
const { createNotification } = require('./notificationController');

// @desc  Apply for a job
// @route POST /api/applications
exports.applyForJob = async (req, res) => {
  const { jobId, coverLetter } = req.body;
  if (!jobId) return res.status(400).json({ success: false, message: 'jobId is required' });

  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

  const already = await Application.findOne({ userId: req.user._id, jobId });
  if (already) return res.status(400).json({ success: false, message: 'Already applied' });

  const fresher = await User.findById(req.user._id);
  if (!fresher.resumeUrl) {
    return res.status(400).json({ success: false, message: 'A resume must be uploaded to apply.' });
  }

  const matchPercentage = calculateMatch(fresher.skills, job.requiredSkills);

  const application = await Application.create({
    userId: req.user._id,
    jobId,
    coverLetter,
    matchPercentage,
    resumeUrl: fresher.resumeUrl,
  });

  // Push to job's applicants list
  job.applicants.push({ userId: req.user._id });
  await job.save();

  // Emit Socket.io notification if io available
  if (req.app.get('io')) {
    req.app.get('io').to(job.companyId.toString()).emit('new_applicant', {
      jobTitle: job.title, fresherName: fresher.name,
    });
  }

  res.status(201).json({ success: true, data: application });
};

// @desc  Get fresher's own applications
// @route GET /api/applications/my
exports.getMyApplications = async (req, res) => {
  const apps = await Application.find({ userId: req.user._id })
    .populate('jobId', 'title company location type salary requiredSkills')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: apps.length, data: apps });
};

// @desc  Get applications for a job (startup)
// @route GET /api/applications/job/:jobId
exports.getJobApplications = async (req, res) => {
  const job = await Job.findOne({ _id: req.params.jobId, companyId: req.user._id });
  if (!job) return res.status(403).json({ success: false, message: 'Not authorised' });

  const apps = await Application.find({ jobId: req.params.jobId })
    .populate('userId', 'name email skills college cgpa avatarUrl assessmentScore education')
    .sort({ matchPercentage: -1 });
  res.json({ success: true, count: apps.length, data: apps });
};

// @desc  Update application status (ATS pipeline)
// @route PATCH /api/applications/:id/status
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Applied', 'Shortlisted', 'Interviewing', 'Selected', 'Rejected', 'Hired'];
  if (!validStatuses.includes(status))
    return res.status(400).json({ success: false, message: 'Invalid status' });

  const app = await Application.findById(req.params.id).populate('jobId');
  if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
  if (app.jobId.companyId.toString() !== req.user._id.toString())
    return res.status(403).json({ success: false, message: 'Not authorised' });

  app.status = status;
  app.history.push({ status });
  await app.save();

  // Notify candidate via Socket.io
  if (req.app.get('io')) {
    req.app.get('io').to(app.userId.toString()).emit('status_changed', {
      jobTitle: app.jobId.title, status,
    });
  }

  // Send email notification async (non-blocking)
  const candidate = await User.findById(app.userId).select('name email');
  if (candidate) {
    createNotification({
      receiver: app.userId,
      sender: req.user._id,
      title: 'Application Update',
      message: `Your application for ${app.jobId.title} is now: ${status}`,
      type: 'application_status'
    }).catch(() => {});
    sendStatusEmail({
      to: candidate.email,
      name: candidate.name,
      jobTitle: app.jobId.title,
      status,
    }).catch(() => {});
  }

  res.json({ success: true, data: app });
};

// @desc  Get ATS board grouped by status
// @route GET /api/applications/ats/:jobId
exports.getAtsBoard = async (req, res) => {
  const job = await Job.findOne({ _id: req.params.jobId, companyId: req.user._id });
  if (!job) return res.status(403).json({ success: false, message: 'Not authorised' });

  const apps = await Application.find({ jobId: req.params.jobId })
    .populate('userId', 'name email skills avatarUrl assessmentScore education')
    .sort({ matchPercentage: -1 });

  const columns = ['Applied', 'Shortlisted', 'Interviewing', 'Selected', 'Rejected', 'Hired'];
  const board = {};
  columns.forEach((c) => (board[c] = []));
  apps.forEach((a) => { if (board[a.status]) board[a.status].push(a); });

  res.json({ success: true, data: board });
};

// @desc  Invite a fresher to apply for a job
// @route POST /api/applications/invite
exports.inviteFresher = async (req, res) => {
  const { jobId, fresherId } = req.body;
  if (!jobId || !fresherId) return res.status(400).json({ success: false, message: 'jobId and fresherId are required' });

  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  if (job.companyId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorised' });
  }

  const fresher = await User.findById(fresherId);
  if (!fresher || fresher.role !== 'fresher') {
    return res.status(404).json({ success: false, message: 'Fresher not found' });
  }

  const already = await Application.findOne({ userId: fresherId, jobId });
  if (already) return res.status(400).json({ success: false, message: 'Already applied or invited' });

  const application = await Application.create({
    userId: fresherId,
    jobId,
    status: 'Invited',
    history: [{ status: 'Invited' }],
  });

  // Notify fresher via socket
  if (req.app.get('io')) {
    req.app.get('io').to(fresherId.toString()).emit('invitation_received', {
      jobTitle: job.title, companyName: req.user.companyName
    });
  }

  createNotification({
    receiver: fresherId,
    sender: req.user._id,
    title: 'New Job Invitation',
    message: `${req.user.companyName} has invited you to apply for ${job.title}.`,
    type: 'invitation'
  }).catch(() => {});

  sendInvitationEmail({
    to: fresher.email,
    fresherName: fresher.name,
    companyName: req.user.companyName,
    jobTitle: job.title
  }).catch(() => {});

  res.status(201).json({ success: true, message: 'Invitation sent successfully', data: application });
};

// @desc  Accept an invitation
// @route POST /api/applications/:id/accept-invite
exports.acceptInvitation = async (req, res) => {
  const application = await Application.findOne({ _id: req.params.id, userId: req.user._id });
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
  if (application.status !== 'Invited') return res.status(400).json({ success: false, message: 'Not an invitation' });

  const fresher = await User.findById(req.user._id);
  if (!fresher.resumeUrl) {
    return res.status(400).json({ success: false, message: 'A resume must be uploaded to accept the invitation.' });
  }

  const job = await Job.findById(application.jobId);
  application.matchPercentage = calculateMatch(fresher.skills, job.requiredSkills);
  application.resumeUrl = fresher.resumeUrl;
  application.status = 'Applied';
  application.history.push({ status: 'Applied' });
  await application.save();

  if (!job.applicants.some(a => a.userId.toString() === req.user._id.toString())) {
    job.applicants.push({ userId: req.user._id });
    await job.save();
  }

  res.json({ success: true, message: 'Invitation accepted and application submitted' });
};
