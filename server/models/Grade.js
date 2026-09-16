const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    subject: { type: String, required: true },
    term: { type: String, required: true },
    academicYear: { type: String, default: '2025/2026' },
    score: { type: Number, required: true },
    maxScore: { type: Number, default: 100 },
    remark: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Grade', GradeSchema);
