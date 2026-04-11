const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  fileUrl: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now },
  grade: { type: String, default: '' },
  marks: { type: Number, default: 0 },
  feedback: { type: String, default: '' },
  status: { type: String, enum: ['submitted', 'graded', 'late'], default: 'submitted' },
});

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    subject: { type: String, required: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    dueDate: { type: Date, required: true },
    maxMarks: { type: Number, default: 100 },
    fileUrl: { type: String, default: '' },
    submissions: [submissionSchema],
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
