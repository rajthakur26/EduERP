const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');
const Result = require('../models/Result');

const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalStudents, totalTeachers, totalUsers] = await Promise.all([
    Student.countDocuments(),
    Teacher.countDocuments(),
    User.countDocuments(),
  ]);

  const feeStats = await Fee.aggregate([
    { $group: { _id: null, totalAmount: { $sum: '$amount' }, totalCollected: { $sum: '$paidAmount' } } },
  ]);

  const attendanceToday = await Attendance.aggregate([
    { $match: { date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const recentStudents = await Student.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email');

  res.json({
    success: true,
    stats: {
      totalStudents,
      totalTeachers,
      totalUsers,
      fees: feeStats[0] || { totalAmount: 0, totalCollected: 0 },
      attendanceToday,
    },
    recentStudents,
  });
});

const getAttendanceAnalytics = asyncHandler(async (req, res) => {
  const { class: cls, section, month, year } = req.query;
  let match = {};
  if (cls) match.class = cls;
  if (section) match.section = section;
  if (month && year) {
    match.date = { $gte: new Date(year, month - 1, 1), $lte: new Date(year, month, 0) };
  }

  const data = await Attendance.aggregate([
    { $match: match },
    { $group: { _id: { status: '$status', date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } }, count: { $sum: 1 } } },
    { $sort: { '_id.date': 1 } },
  ]);

  res.json({ success: true, data });
});

const getFeeAnalytics = asyncHandler(async (req, res) => {
  const data = await Fee.aggregate([
    { $group: { _id: { month: { $month: '$dueDate' }, year: { $year: '$dueDate' } }, totalAmount: { $sum: '$amount' }, collected: { $sum: '$paidAmount' }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
  res.json({ success: true, data });
});

const getResultAnalytics = asyncHandler(async (req, res) => {
  const { class: cls, examName } = req.query;
  let match = {};
  if (cls) match.class = cls;
  if (examName) match.examName = examName;

  const data = await Result.aggregate([
    { $match: match },
    { $group: { _id: '$overallGrade', count: { $sum: 1 }, avgPercentage: { $avg: '$percentage' } } },
    { $sort: { _id: 1 } },
  ]);
  res.json({ success: true, data });
});

module.exports = { getDashboardStats, getAttendanceAnalytics, getFeeAnalytics, getResultAnalytics };
