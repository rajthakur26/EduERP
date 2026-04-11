const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  marksObtained: { type: Number, required: true },
  maxMarks: { type: Number, required: true },
  grade: { type: String, default: '' },
});

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    examName: { type: String, required: true },
    examType: { type: String, enum: ['unit-test', 'midterm', 'final', 'quiz'], default: 'unit-test' },
    class: { type: String, required: true },
    section: { type: String, required: true },
    academicYear: { type: String, required: true },
    marks: [markSchema],
    totalMarks: { type: Number, default: 0 },
    totalMaxMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    overallGrade: { type: String, default: '' },
    rank: { type: Number, default: 0 },
    remarks: { type: String, default: '' },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

resultSchema.pre('save', function (next) {
  if (this.marks && this.marks.length > 0) {
    this.totalMarks = this.marks.reduce((sum, m) => sum + m.marksObtained, 0);
    this.totalMaxMarks = this.marks.reduce((sum, m) => sum + m.maxMarks, 0);
    this.percentage = this.totalMaxMarks > 0
      ? parseFloat(((this.totalMarks / this.totalMaxMarks) * 100).toFixed(2))
      : 0;
    if (this.percentage >= 90) this.overallGrade = 'A+';
    else if (this.percentage >= 80) this.overallGrade = 'A';
    else if (this.percentage >= 70) this.overallGrade = 'B';
    else if (this.percentage >= 60) this.overallGrade = 'C';
    else if (this.percentage >= 50) this.overallGrade = 'D';
    else this.overallGrade = 'F';
  }
  next();
});

module.exports = mongoose.model('Result', resultSchema);
