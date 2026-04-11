const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendEmail, welcomeEmail } = require('../utils/email');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Admin
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, ...extra } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password, role });

  // Create role-specific profile
  if (role === 'student') {
    await Student.create({
      user: user._id,
      rollNumber: extra.rollNumber || `STU${Date.now()}`,
      class: extra.class || '1',
      section: extra.section || 'A',
      ...extra,
    });
  } else if (role === 'teacher') {
    await Teacher.create({
      user: user._id,
      employeeId: extra.employeeId || `TCH${Date.now()}`,
      subjects: extra.subjects || [],
      classes: extra.classes || [],
      ...extra,
    });
  }

  // Send welcome email (non-blocking)
  sendEmail(welcomeEmail(name, email, role)).catch(console.error);

  res.status(201).json({ success: true, message: 'User registered successfully', user });
});

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    res.status(401);
    throw new Error('Invalid credentials or account deactivated');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id, user.role);

  user.refreshToken = refreshToken;
  await user.save();

  res.json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) {
    res.status(401);
    throw new Error('Refresh token required');
  }

  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.id);

  if (!user || user.refreshToken !== token) {
    res.status(401);
    throw new Error('Invalid refresh token');
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id, user.role);

  user.refreshToken = newRefreshToken;
  await user.save();

  res.json({ success: true, accessToken, refreshToken: newRefreshToken });
});

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.refreshToken = '';
    await user.save();
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  let profile = null;

  if (user.role === 'student') {
    profile = await Student.findOne({ user: user._id });
  } else if (user.role === 'teacher') {
    profile = await Teacher.findOne({ user: user._id });
  }

  res.json({ success: true, user, profile });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, phone, address, avatar } = req.body;

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address) user.address = address;
  if (avatar) user.avatar = avatar;

  await user.save();
  res.json({ success: true, user });
});

module.exports = { register, login, refreshToken, logout, getMe, updateProfile };
