const asyncHandler = require('express-async-handler');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

const markAttendance = asyncHandler(async (req, res) => {
  const { records, date, subject, class: cls, section } = req.body;
  const teacher = await Teacher.findOne({ user: req.user._id });

  const results = await Promise.all(
    records.map(async ({ studentId, status, remarks }) => {
      return Attendance.findOneAndUpdate(
        { student: studentId, date: new Date(date), subject: subject || 'General' },
        { student: studentId, date: new Date(date), status, remarks, subject: subject || 'General', class: cls, section, teacher: teacher?._id },
        { upsert: true, new: true }
      );
    })
  );

  res.status(201).json({ success: true, count: results.length, message: 'Attendance marked successfully' });
});

const getAttendanceByClass = asyncHandler(async (req, res) => {
  const { class: cls, section, date, subject } = req.query;
  let query = {};
  if (cls) query.class = cls;
  if (section) query.section = section;
  if (date) {
    const d = new Date(date);
    const next = new Date(d); next.setDate(next.getDate() + 1);
    query.date = { $gte: d, $lt: next };
  }
  if (subject) query.subject = subject;

  const attendance = await Attendance.find(query).populate({ path: 'student', populate: { path: 'user', select: 'name email' } });
  res.json({ success: true, count: attendance.length, attendance });
});

const getStudentAttendance = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { month, year, subject } = req.query;

  let query = { student: studentId };
  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    query.date = { $gte: start, $lte: end };
  }
  if (subject) query.subject = subject;

  const records = await Attendance.find(query).sort({ date: -1 });
  const total = records.length;
  const present = records.filter((r) => r.status === 'present' || r.status === 'late').length;
  const percentage = total > 0 ? parseFloat(((present / total) * 100).toFixed(2)) : 0;

  res.json({ success: true, records, stats: { total, present, absent: total - present, percentage } });
});

const getMyAttendance = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) { res.status(404); throw new Error('Student not found'); }

  const { month, year } = req.query;
  let query = { student: student._id };
  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    query.date = { $gte: start, $lte: end };
  }

  const records = await Attendance.find(query).sort({ date: -1 });
  const total = records.length;
  const present = records.filter((r) => r.status === 'present' || r.status === 'late').length;
  const percentage = total > 0 ? parseFloat(((present / total) * 100).toFixed(2)) : 0;

  res.json({ success: true, records, stats: { total, present, absent: total - present, percentage } });
});

module.exports = { markAttendance, getAttendanceByClass, getStudentAttendance, getMyAttendance };
