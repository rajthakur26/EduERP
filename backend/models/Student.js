const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rollNumber: { type: String, required: true, unique: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    admissionDate: { type: Date, default: Date.now },
    parentName: { type: String, default: '' },
    parentPhone: { type: String, default: '' },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    bloodGroup: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
