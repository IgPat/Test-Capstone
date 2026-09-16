const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    admissionNumber: { type: String, required: true, unique: true },
    dob: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    contact: { type: String },
    phone: { type: String },
    address: { type: String },
    guardianName: { type: String },
    guardianContact: { type: String },
    guardianPhone: { type: String },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    enrollmentDate: { type: Date, default: Date.now },
    photoUrl: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
