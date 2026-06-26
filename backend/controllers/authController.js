const User = require('../models/User');
const jwt  = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../utils/email');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

const sendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };
  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: {
        _id: user._id, name: user.name, email: user.email,
        role: user.role, avatarUrl: user.avatarUrl,
        companyId: user.companyId, companyName: user.companyName,
      },
    });
};

// @desc  Register user
// @route POST /api/auth/register
exports.register = async (req, res) => {
  const { name, email, password, role, companyName, college, skills } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Please fill all required fields' });
  }
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

  const user = await User.create({
    name, email, password, role,
    ...(role === 'startup' && { companyName }),
    ...(role === 'fresher' && { college, skills: skills || [] }),
  });
  // Send welcome email async (non-blocking)
  sendWelcomeEmail(user).catch(() => {});
  sendToken(user, 201, res);
};

// @desc  Login user
// @route POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Please provide email and password' });

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ success: false, message: 'Invalid credentials' });

  if (!user.isActive)
    return res.status(403).json({ success: false, message: 'Account is deactivated' });

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });
  sendToken(user, 200, res);
};

// @desc  Logout (clear cookie)
// @route POST /api/auth/logout
exports.logout = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: 'Logged out successfully' });
};

// @desc  Get current logged-in user
// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ success: true, data: user });
};

// @desc  Update profile
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  const fields = ['name', 'bio', 'skills', 'college', 'graduationYear', 'cgpa', 'companyName', 'avatarUrl', 'resumeUrl'];
  const updates = {};
  fields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, data: user });
};
