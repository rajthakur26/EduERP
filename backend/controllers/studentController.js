const asyncHandler = require('express-async-handler');
const Student = require('../models/Student');
const User = require('../models/User');

const getStudents = asyncHandler(async (req, res) => {
  const { class: cls, section, search } = req.query;
  let query = {};
  if (cls) query.class = cls;
  if (section) query.section = section;

  let students = await Student.find(query).populate('user', 'name email phone avatar isActive');

  if (search) {
    const s = search.toLowerCase();
    students = students.filter(
      (st) =>
        st.user.name.toLowerCase().includes(s) ||
        st.rollNumber.toLowerCase().includes(s) ||
        st.user.email.toLowerCase().includes(s)
    );
  }

  res.json({ success: true, count: students.length, students });
});

const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate('user', '-password -refreshToken');
  if (!student) { res.status(404); throw new Error('Student not found'); }
  res.json({ success: true, student });
});

const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) { res.status(404); throw new Error('Student not found'); }
  Object.assign(student, req.body);
  await student.save();
  res.json({ success: true, student });
});

const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) { res.status(404); throw new Error('Student not found'); }
  await User.findByIdAndUpdate(student.user, { isActive: false });
  res.json({ success: true, message: 'Student deactivated' });
});

const getMyProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id }).populate('user', '-password -refreshToken');
  if (!student) { res.status(404); throw new Error('Student profile not found'); }
  res.json({ success: true, student });
});

module.exports = { getStudents, getStudentById, updateStudent, deleteStudent, getMyProfile };
