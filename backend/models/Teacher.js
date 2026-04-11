const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employeeId: { type: String, required: true, unique: true },
    subjects: [{ type: String }],
    classes: [{ type: String }],
    qualification: { type: String, default: '' },
    experience: { type: Number, default: 0 },
    joiningDate: { type: Date, default: Date.now },
    salary: { type: Number, default: 0 },
    department: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);
