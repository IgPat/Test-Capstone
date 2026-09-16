const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const { requireRole, requireAdminOrOwner } = require('../middleware/roleCheck');

router.use(protect);

router.post('/', requireRole('admin'), ctrl.markAttendance);
router.get('/class/:classId', requireRole('admin'), ctrl.getClassAttendance);
router.get('/my-history', requireRole('student', 'admin'), ctrl.getMyAttendance);
router.get('/student/:id', requireAdminOrOwner(ctrl.getOwnerIdForAttendanceRoute), ctrl.getStudentAttendance);

module.exports = router;
