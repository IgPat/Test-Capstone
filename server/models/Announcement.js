const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    audience: { type: String, default: 'all' }, // "all" or a Class _id string
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', AnnouncementSchema);
