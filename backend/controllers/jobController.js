const Job = require('../models/Job');
const Company = require('../models/Company');
const User = require('../models/User');
const { calculateMatch } = require('../utils/matchScore');
const { createNotification } = require('./notificationController');
const { sendNewJobEmail } = require('../utils/email');

// @desc  Get all jobs (filtered/sorted by match for freshers)
// @route GET /api/jobs
exports.getJobs = async (req, res) => {
  const { search, type, domain, location } = req.query;
  const filter = { status: 'Open' };
  
  if (req.user?.role === 'fresher') {
    const followingCompanies = await Company.find({ followers: req.user._id }).select('userId');
    const followedCompanyIds = followingCompanies.map(c => c.userId);

    filter.$and = [
      {
        $or: [
          { visibility: 'public' },
          { visibility: 'private', companyId: { $in: followedCompanyIds } }
        ]
      }
    ];
  } else {
    filter.visibility = 'public';
  }

  const searchFilter = {};
  if (search) {
    const regex = new RegExp(search, 'i');
    searchFilter.$or = [{ title: regex }, { description: regex }, { company: regex }];
  }
  if (type) searchFilter.type = type;
  if (domain) searchFilter.domain = domain;
  if (location) searchFilter.location = location;

  if (Object.keys(searchFilter).length > 0) {
    if (!filter.$and) filter.$and = [];
    filter.$and.push(searchFilter);
  }

  let jobs = await Job.find(filter).sort({ createdAt: -1 });

  // If fresher, attach match percentage
  if (req.user?.role === 'fresher') {
    const fresherSkills = req.user.skills || [];
    jobs = jobs.map((job) => ({
      ...job.toObject(),
      matchPercentage: calculateMatch(fresherSkills, job.requiredSkills),
    })).sort((a, b) => b.matchPercentage - a.matchPercentage);
  }

  res.json({ success: true, count: jobs.length, data: jobs });
};

// @desc  Create a job
// @route POST /api/jobs
exports.createJob = async (req, res) => {
  const job = await Job.create({ ...req.body, companyId: req.user._id, company: req.user.companyName });

  // Notify followers
  const company = await Company.findOne({ userId: req.user._id }).populate('followers', 'name email');
  if (company && company.followers.length > 0) {
    company.followers.forEach(follower => {
      if (req.app.get('io')) {
        req.app.get('io').to(follower._id.toString()).emit('new_job_posted', {
          jobTitle: job.title, companyName: req.user.companyName, jobId: job._id
        });
      }
      createNotification({
        receiver: follower._id,
        sender: req.user._id,
        title: 'New Job Posted',
        message: `${req.user.companyName} posted a new job: ${job.title}`,
        type: 'general'
      }).catch(() => {});
      sendNewJobEmail({
        to: follower.email,
        fresherName: follower.name,
        companyName: req.user.companyName,
        jobTitle: job.title
      }).catch(() => {});
    });
  }

  res.status(201).json({ success: true, data: job });
};

// @desc  Update a job
// @route PUT /api/jobs/:id
exports.updateJob = async (req, res) => {
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, companyId: req.user._id },
    req.body, { new: true, runValidators: true }
  );
  if (!job) return res.status(404).json({ success: false, message: 'Job not found or not authorised' });
  res.json({ success: true, data: job });
};

// @desc  Delete a job
// @route DELETE /api/jobs/:id
exports.deleteJob = async (req, res) => {
  const job = await Job.findOneAndDelete({ _id: req.params.id, companyId: req.user._id });
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  res.json({ success: true, message: 'Job deleted' });
};

// @desc  Get single job by ID
// @route GET /api/jobs/:id
exports.getJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

  // Private job access check
  if (job.visibility === 'private' && req.user?.role === 'fresher') {
    const company = await Company.findOne({ userId: job.companyId });
    const isFollower = company?.followers?.includes(req.user._id);
    if (!isFollower) {
      return res.json({
        success: true,
        data: {
          _id: job._id,
          title: job.title,
          company: job.company,
          companyId: job.companyId,
          visibility: job.visibility,
          isLocked: true,
        },
      });
    }
  }

  const jobObj = job.toObject();
  jobObj.isLocked = false;
  if (req.user?.role === 'fresher') {
    jobObj.matchPercentage = calculateMatch(req.user.skills || [], job.requiredSkills);
  }
  res.json({ success: true, data: jobObj });
};

// @desc  Get startup's own jobs
// @route GET /api/jobs/my
exports.getMyJobs = async (req, res) => {
  const jobs = await Job.find({ companyId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: jobs.length, data: jobs });
};
