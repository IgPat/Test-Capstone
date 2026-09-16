const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');

// GET /api/announcements - visible to admin & student, student sees "all" + their class
exports.listAnnouncements = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'student') {
      const profile = await StudentProfile.findById(req.user.studentProfile);
      const classId = profile?.classId?.toString();
      filter = { $or: [{ audience: 'all' }, ...(classId ? [{ audience: classId }] : [])] };
    }
    const announcements = await Announcement.find(filter).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: 'Failed to list announcements', error: err.message });
  }
};

// POST /api/announcements - Admin only
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, body, audience } = req.body;
    if (!title || !body) return res.status(400).json({ message: 'title and body are required' });

    const announcement = await Announcement.create({
      title,
      body,
      audience: audience || 'all',
      createdBy: req.user._id,
    });

    // fan out a notification to the relevant students
    let students;
    if (!audience || audience === 'all') {
      students = await StudentProfile.find({ status: 'active' });
    } else {
      students = await StudentProfile.find({ classId: audience, status: 'active' });
    }
    const notifications = students.map((s) => ({
      user: s.user,
      message: `New announcement: ${title}`,
    }));
    if (notifications.length) await Notification.insertMany(notifications);

    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create announcement', error: err.message });
  }
};

// PUT /api/announcements/:id - Admin only
exports.updateAnnouncement = async (req, res) => {
  try {
    const { title, body, audience } = req.body;
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, body, audience },
      { new: true }
    );
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    res.json(announcement);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update announcement', error: err.message });
  }
};

// DELETE /api/announcements/:id - Admin only
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete announcement', error: err.message });
  }
};
