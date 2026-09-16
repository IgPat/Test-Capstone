const StudentProfile = require('../models/StudentProfile');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const Invoice = require('../models/Invoice');
const Grade = require('../models/Grade');
const Announcement = require('../models/Announcement');

// GET /api/dashboard/admin
exports.adminDashboard = async (req, res) => {
  try {
    const totalStudents = await StudentProfile.countDocuments({ status: 'active' });
    const totalClasses = await Class.countDocuments();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayRecords = await Attendance.find({ date: { $gte: todayStart, $lte: todayEnd } });
    const presentToday = todayRecords.filter((r) => r.status === 'present').length;
    const attendanceRateToday = todayRecords.length
      ? Math.round((presentToday / todayRecords.length) * 1000) / 10
      : 0;

    const invoices = await Invoice.find();
    const feesCollected = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
    const feesOutstanding = invoices.reduce((sum, i) => sum + (i.totalAmount - i.amountPaid), 0);

    const recentAnnouncements = await Announcement.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      totalStudents,
      totalClasses,
      attendanceRateToday,
      feesCollected,
      feesOutstanding,
      recentAnnouncements,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load admin dashboard', error: err.message });
  }
};

// GET /api/dashboard/student
exports.studentDashboard = async (req, res) => {
  try {
    const profileId = req.user.studentProfile;
    const records = await Attendance.find({ student: profileId });
    const present = records.filter((r) => r.status === 'present').length;
    const attendancePercentage = records.length ? Math.round((present / records.length) * 1000) / 10 : 0;

    const latestGrades = await Grade.find({ student: profileId }).sort({ createdAt: -1 }).limit(5);

    const invoices = await Invoice.find({ student: profileId });
    const feeBalance = invoices.reduce((sum, i) => sum + (i.totalAmount - i.amountPaid), 0);

    const announcements = await Announcement.find({ audience: 'all' }).sort({ createdAt: -1 }).limit(5);

    res.json({ attendancePercentage, latestGrades, feeBalance, announcements });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load student dashboard', error: err.message });
  }
};
