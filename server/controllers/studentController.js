const bcrypt = require('bcryptjs');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const Class = require('../models/Class');

// GET /api/students?page=&limit=&search=&classId=&status=
exports.listStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = {};

    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.status) filter.status = req.query.status;

    let query = StudentProfile.find(filter)
      .populate('user', 'name email')
      .populate('classId', 'name')
      .sort({ createdAt: -1 });

    if (req.query.search) {
      const students = await StudentProfile.find(filter).populate('user', 'name email');
      const term = req.query.search.toLowerCase();
      const filtered = students.filter(
        (s) =>
          s.user?.name?.toLowerCase().includes(term) ||
          s.admissionNumber?.toLowerCase().includes(term)
      );
      return res.json({
        data: filtered.slice((page - 1) * limit, page * limit),
        total: filtered.length,
        page,
        pages: Math.ceil(filtered.length / limit),
      });
    }

    const total = await StudentProfile.countDocuments(filter);
    const data = await query.skip((page - 1) * limit).limit(limit);

    res.json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list students', error: err.message });
  }
};

// GET /api/students/me
exports.getMe = async (req, res) => {
  try {
    if (!req.user.studentProfile) {
      return res.status(404).json({ message: 'No student profile linked to this account' });
    }
    const student = await StudentProfile.findById(req.user.studentProfile)
      .populate('user', 'name email')
      .populate('classId', 'name subjects');
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get profile', error: err.message });
  }
};

// PUT /api/students/me
exports.updateMe = async (req, res) => {
  try {
    if (!req.user.studentProfile) {
      return res.status(404).json({ message: 'No student profile linked to this account' });
    }
    const student = await StudentProfile.findById(req.user.studentProfile);
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const selfFields = ['phone', 'contact', 'address', 'guardianName', 'guardianPhone', 'guardianContact'];
    selfFields.forEach((field) => {
      if (req.body[field] !== undefined) student[field] = req.body[field];
    });

    if (req.body.phone !== undefined) student.contact = req.body.phone;
    if (req.body.guardianPhone !== undefined) student.guardianContact = req.body.guardianPhone;
    if (req.body.contact !== undefined && !student.phone) student.phone = req.body.contact;
    if (req.body.guardianContact !== undefined && !student.guardianPhone) student.guardianPhone = req.body.guardianContact;

    await student.save();
    const updated = await StudentProfile.findById(student._id)
      .populate('user', 'name email')
      .populate('classId', 'name subjects');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};

// GET /api/students/:id
exports.getStudent = async (req, res) => {
  try {
    const student = await StudentProfile.findById(req.params.id)
      .populate('user', 'name email')
      .populate('classId', 'name subjects');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get student', error: err.message });
  }
};


// POST /api/students  (Admin creates a full account + profile)
exports.createStudent = async (req, res) => {
  try {
    const { name, email, password, admissionNumber, dob, gender, contact, guardianName, guardianContact, classId } = req.body;

    if (!name || !email || !password || !admissionNumber) {
      return res.status(400).json({ message: 'name, email, password and admissionNumber are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role: 'student' });

    const profile = await StudentProfile.create({
      user: user._id,
      admissionNumber,
      dob,
      gender,
      contact,
      guardianName,
      guardianContact,
      classId: classId || undefined,
    });

    user.studentProfile = profile._id;
    await user.save();

    if (classId) {
      await Class.findByIdAndUpdate(classId, { $addToSet: { students: profile._id } });
    }

    res.status(201).json(profile);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Admission number already in use' });
    res.status(500).json({ message: 'Failed to create student', error: err.message });
  }
};

// PUT /api/students/:id
// Admin can edit any field. A student hitting their own record may only
// change a limited "self-service" field set.
exports.updateStudent = async (req, res) => {
  try {
    const student = await StudentProfile.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const adminFields = ['dob', 'gender', 'guardianName', 'guardianContact', 'classId', 'status', 'admissionNumber'];
    const selfFields = ['contact', 'photoUrl', 'guardianContact'];

    const allowedFields = req.user.role === 'admin' ? [...adminFields, ...selfFields] : selfFields;

    const previousClassId = student.classId ? student.classId.toString() : null;

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) student[field] = req.body[field];
    });

    await student.save();

    // keep Class.students in sync if classId changed (admin only)
    if (req.user.role === 'admin' && req.body.classId !== undefined) {
      const newClassId = req.body.classId || null;
      if (previousClassId && previousClassId !== newClassId) {
        await Class.findByIdAndUpdate(previousClassId, { $pull: { students: student._id } });
      }
      if (newClassId) {
        await Class.findByIdAndUpdate(newClassId, { $addToSet: { students: student._id } });
      }
    }

    if (req.body.name && req.user.role === 'admin') {
      await User.findByIdAndUpdate(student.user, { name: req.body.name });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update student', error: err.message });
  }
};

// DELETE /api/students/:id  (Admin only - deactivates rather than hard-deleting)
exports.deleteStudent = async (req, res) => {
  try {
    const student = await StudentProfile.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deactivated', student });
  } catch (err) {
    res.status(500).json({ message: 'Failed to deactivate student', error: err.message });
  }
};

// PUT /api/students/:id/reset-password  (Admin only)
// Minimum-viable "forgot password" flow per the PRD: rather than emailing a
// reset link, the admin generates/sets a new temporary password for the
// student and shares it with them out of band.
exports.resetPassword = async (req, res) => {
  try {
    const student = await StudentProfile.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const tempPassword = req.body.newPassword || Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    await User.findByIdAndUpdate(student.user, { passwordHash });

    res.json({ message: 'Password reset', tempPassword });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset password', error: err.message });
  }
};

// Helper used by ownership middleware
exports.getOwnerIdForStudentRoute = async (req) => req.params.id;
