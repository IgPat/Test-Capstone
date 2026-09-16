const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    subjects: [{ type: String }],
    capacity: { type: Number, default: 40 },
    homeroom: { type: String },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Class', ClassSchema);
