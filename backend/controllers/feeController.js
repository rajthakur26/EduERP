const asyncHandler = require('express-async-handler');
const Fee = require('../models/Fee');
const Student = require('../models/Student');

const createFee = asyncHandler(async (req, res) => {
  const fee = await Fee.create({ ...req.body, collectedBy: req.user._id });
  res.status(201).json({ success: true, fee });
});

const getFees = asyncHandler(async (req, res) => {
  const { studentId, status, feeType, academicYear } = req.query;
  let query = {};
  if (studentId) query.student = studentId;
  if (status) query.status = status;
  if (feeType) query.feeType = feeType;
  if (academicYear) query.academicYear = academicYear;

  const fees = await Fee.find(query).populate({ path: 'student', populate: { path: 'user', select: 'name email' } }).sort({ dueDate: 1 });
  res.json({ success: true, count: fees.length, fees });
});

const getFeeById = asyncHandler(async (req, res) => {
  const fee = await Fee.findById(req.params.id).populate({ path: 'student', populate: { path: 'user', select: 'name email' } });
  if (!fee) { res.status(404); throw new Error('Fee not found'); }
  res.json({ success: true, fee });
});

const updateFee = asyncHandler(async (req, res) => {
  const fee = await Fee.findById(req.params.id);
  if (!fee) { res.status(404); throw new Error('Fee not found'); }
  const { paidAmount, paymentMethod, transactionId } = req.body;
  if (paidAmount !== undefined) {
    fee.paidAmount = paidAmount;
    fee.paidDate = new Date();
    if (paidAmount >= fee.amount) fee.status = 'paid';
    else if (paidAmount > 0) fee.status = 'partial';
  }
  if (paymentMethod) fee.paymentMethod = paymentMethod;
  if (transactionId) fee.transactionId = transactionId;
  Object.assign(fee, req.body);
  await fee.save();
  res.json({ success: true, fee });
});

const getMyFees = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) { res.status(404); throw new Error('Student not found'); }
  const fees = await Fee.find({ student: student._id }).sort({ dueDate: 1 });
  const total = fees.reduce((s, f) => s + f.amount, 0);
  const paid = fees.reduce((s, f) => s + f.paidAmount, 0);
  res.json({ success: true, fees, summary: { total, paid, pending: total - paid } });
});

const getFeeStats = asyncHandler(async (req, res) => {
  const { academicYear } = req.query;
  let match = {};
  if (academicYear) match.academicYear = academicYear;

  const stats = await Fee.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' }, collected: { $sum: '$paidAmount' } } },
  ]);
  res.json({ success: true, stats });
});

module.exports = { createFee, getFees, getFeeById, updateFee, getMyFees, getFeeStats };
