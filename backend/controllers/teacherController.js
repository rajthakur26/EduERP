const asyncHandler = require('express-async-handler');
const Teacher = require('../models/Teacher');
const User = require('../models/User');

const getTeachers = asyncHandler(async (req, res) => {
  const { department, search } = req.query;
  let query = {};
  if (department) query.department = department;

  let teachers = await Teacher.find(query).populate('user', 'name email phone avatar isActive');

  if (search) {
    const s = search.toLowerCase();
    teachers = teachers.filter(
      (t) =>
        t.user.name.toLowerCase().includes(s) ||
        t.employeeId.toLowerCase().includes(s) ||
        t.user.email.toLowerCase().includes(s)
    );
  }

  res.json({ success: true, count: teachers.length, teachers });
});

const getTeacherById = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).populate('user', '-password -refreshToken');
  if (!teacher) { res.status(404); throw new Error('Teacher not found'); }
  res.json({ success: true, teacher });
});

const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) { res.status(404); throw new Error('Teacher not found'); }
  Object.assign(teacher, req.body);
  await teacher.save();
  res.json({ success: true, teacher });
});

const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) { res.status(404); throw new Error('Teacher not found'); }
  await User.findByIdAndUpdate(teacher.user, { isActive: false });
  res.json({ success: true, message: 'Teacher deactivated' });
});

const getMyProfile = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id }).populate('user', '-password -refreshToken');
  if (!teacher) { res.status(404); throw new Error('Teacher profile not found'); }
  res.json({ success: true, teacher });
});

module.exports = { getTeachers, getTeacherById, updateTeacher, deleteTeacher, getMyProfile };
