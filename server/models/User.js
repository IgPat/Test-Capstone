const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'student'], default: 'student' },
    studentProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile' },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

UserSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    studentProfile: this.studentProfile,
  };
};

module.exports = mongoose.model('User', UserSchema);
