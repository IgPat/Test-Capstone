const Attendance = require('../models/Attendance');

// POST /api/attendance  - Admin marks attendance for one or many students on a date
// body: { classId, date, records: [{ student, status }] }
exports.markAttendance = async (req, res) => {
  try {
    const { classId, date, records } = req.body;
    if (!classId || !date || !Array.isArray(records)) {
      return res.status(400).json({ message: 'classId, date and records[] are required' });
    }

    const ops = records.map((r) => ({
      updateOne: {
        filter: { student: r.student, classId, date: new Date(date) },
        update: { $set: { status: r.status } },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(ops);
    const saved = await Attendance.find({ classId, date: new Date(date) }).populate({
      path: 'student',
      populate: { path: 'user', select: 'name' },
    });
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark attendance', error: err.message });
  }
};

// GET /api/attendance/class/:classId?date=&from=&to=
exports.getClassAttendance = async (req, res) => {
  try {
    const filter = { classId: req.params.classId };
    if (req.query.date) filter.date = new Date(req.query.date);
    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = new Date(req.query.from);
      if (req.query.to) filter.date.$lte = new Date(req.query.to);
    }
    const records = await Attendance.find(filter)
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch attendance', error: err.message });
  }
};

// GET /api/attendance/student/:id?from=&to=
exports.getStudentAttendance = async (req, res) => {
  try {
    const filter = { student: req.params.id };
    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = new Date(req.query.from);
      if (req.query.to) filter.date.$lte = new Date(req.query.to);
    }
    const records = await Attendance.find(filter).sort({ date: -1 });

    const total = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const attendancePercentage = total ? Math.round((present / total) * 1000) / 10 : 0;

    res.json({ records, history: records, attendancePercentage, summary: { total, present, percentage: attendancePercentage } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch attendance', error: err.message });
  }
};

// GET /api/attendance/my-history
exports.getMyAttendance = async (req, res) => {
  try {
    if (!req.user.studentProfile) {
      return res.status(404).json({ message: 'No student profile linked' });
    }
    req.params.id = req.user.studentProfile.toString();
    return exports.getStudentAttendance(req, res);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch attendance history', error: err.message });
  }
};

exports.getOwnerIdForAttendanceRoute = async (req) => req.params.id;
