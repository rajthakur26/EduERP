const asyncHandler = require('express-async-handler');
const Result = require('../models/Result');
const Student = require('../models/Student');

const addResult = asyncHandler(async (req, res) => {
  const { studentId, examName, examType, class: cls, section, academicYear, marks, remarks } = req.body;

  const result = await Result.create({
    student: studentId, examName, examType, class: cls, section, academicYear, marks, remarks,
    publishedBy: req.user._id,
  });

  res.status(201).json({ success: true, result });
});

const getResultsByClass = asyncHandler(async (req, res) => {
  const { class: cls, section, examName, academicYear } = req.query;
  let query = {};
  if (cls) query.class = cls;
  if (section) query.section = section;
  if (examName) query.examName = examName;
  if (academicYear) query.academicYear = academicYear;

  const results = await Result.find(query).populate({ path: 'student', populate: { path: 'user', select: 'name email' } });
  res.json({ success: true, count: results.length, results });
});

const getStudentResults = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const results = await Result.find({ student: studentId }).sort({ createdAt: -1 });
  res.json({ success: true, results });
});

const getMyResults = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) { res.status(404); throw new Error('Student not found'); }
  const results = await Result.find({ student: student._id }).sort({ createdAt: -1 });
  res.json({ success: true, results });
});

const updateResult = asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.id);
  if (!result) { res.status(404); throw new Error('Result not found'); }
  Object.assign(result, req.body);
  await result.save();
  res.json({ success: true, result });
});

const deleteResult = asyncHandler(async (req, res) => {
  await Result.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Result deleted' });
});

module.exports = { addResult, getResultsByClass, getStudentResults, getMyResults, updateResult, deleteResult };
