const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
  },
  { timestamps: true }
);

AttendanceSchema.index({ student: 1, classId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
