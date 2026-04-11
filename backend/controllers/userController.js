const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const getUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const query = role ? { role } : {};
  const users = await User.find(query).select('-password -refreshToken');
  res.json({ success: true, count: users.length, users });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -refreshToken');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, user });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  const { name, email, phone, address, isActive, avatar } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (address) user.address = address;
  if (isActive !== undefined) user.isActive = isActive;
  if (avatar) user.avatar = avatar;
  await user.save();
  res.json({ success: true, user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, message: 'User deactivated' });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) { res.status(400); throw new Error('Current password is incorrect'); }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password changed successfully' });
});

module.exports = { getUsers, getUserById, updateUser, deleteUser, changePassword };
