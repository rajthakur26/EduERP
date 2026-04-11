const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    feeType: { type: String, enum: ['tuition', 'transport', 'library', 'sports', 'other'], default: 'tuition' },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    status: { type: String, enum: ['pending', 'paid', 'overdue', 'partial'], default: 'pending' },
    paidAmount: { type: Number, default: 0 },
    transactionId: { type: String, default: '' },
    paymentMethod: { type: String, enum: ['cash', 'online', 'cheque', 'bank-transfer'], default: 'cash' },
    academicYear: { type: String, required: true },
    month: { type: String, default: '' },
    remarks: { type: String, default: '' },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fee', feeSchema);
