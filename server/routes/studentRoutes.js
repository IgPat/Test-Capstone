const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/studentController');
const { protect } = require('../middleware/auth');
const { requireRole, requireAdminOrOwner } = require('../middleware/roleCheck');

router.use(protect);

router.get('/', requireRole('admin'), ctrl.listStudents);
router.post('/', requireRole('admin'), ctrl.createStudent);
router.get('/me', requireRole('student', 'admin'), ctrl.getMe);
router.put('/me', requireRole('student', 'admin'), ctrl.updateMe);
router.get('/:id', requireAdminOrOwner(ctrl.getOwnerIdForStudentRoute), ctrl.getStudent);
router.put('/:id', requireAdminOrOwner(ctrl.getOwnerIdForStudentRoute), ctrl.updateStudent);
router.delete('/:id', requireRole('admin'), ctrl.deleteStudent);
router.put('/:id/reset-password', requireRole('admin'), ctrl.resetPassword);

module.exports = router;
