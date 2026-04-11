const asyncHandler = require('express-async-handler');
const Assignment = require('../models/Assignment');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

const createAssignment = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });
  if (!teacher) { res.status(404); throw new Error('Teacher profile not found'); }
  const assignment = await Assignment.create({ ...req.body, teacher: teacher._id });
  res.status(201).json({ success: true, assignment });
});

const getAssignments = asyncHandler(async (req, res) => {
  const { class: cls, section, subject } = req.query;
  let query = {};
  if (cls) query.class = cls;
  if (section) query.section = section;
  if (subject) query.subject = subject;

  if (req.user.role === 'teacher') {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (teacher) query.teacher = teacher._id;
  }

  const assignments = await Assignment.find(query).populate('teacher').sort({ dueDate: 1 });
  res.json({ success: true, count: assignments.length, assignments });
});

const getAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id).populate('teacher submissions.student');
  if (!assignment) { res.status(404); throw new Error('Assignment not found'); }
  res.json({ success: true, assignment });
});

const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) { res.status(404); throw new Error('Assignment not found'); }
  Object.assign(assignment, req.body);
  await assignment.save();
  res.json({ success: true, assignment });
});

const submitAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) { res.status(404); throw new Error('Assignment not found'); }
  const student = await Student.findOne({ user: req.user._id });
  if (!student) { res.status(404); throw new Error('Student not found'); }

  const existingIdx = assignment.submissions.findIndex((s) => s.student?.toString() === student._id.toString());
  const submissionData = { student: student._id, fileUrl: req.body.fileUrl || '', submittedAt: new Date(), status: new Date() > assignment.dueDate ? 'late' : 'submitted' };

  if (existingIdx >= 0) assignment.submissions[existingIdx] = submissionData;
  else assignment.submissions.push(submissionData);

  await assignment.save();
  res.json({ success: true, message: 'Assignment submitted' });
});

const gradeSubmission = asyncHandler(async (req, res) => {
  const { studentId, marks, grade, feedback } = req.body;
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) { res.status(404); throw new Error('Assignment not found'); }

  const submission = assignment.submissions.find((s) => s.student?.toString() === studentId);
  if (!submission) { res.status(404); throw new Error('Submission not found'); }

  submission.marks = marks;
  submission.grade = grade;
  submission.feedback = feedback;
  submission.status = 'graded';
  await assignment.save();
  res.json({ success: true, message: 'Graded successfully' });
});

module.exports = { createAssignment, getAssignments, getAssignmentById, updateAssignment, submitAssignment, gradeSubmission };
