const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/gradeController');
const { protect } = require('../middleware/auth');
const { requireRole, requireAdminOrOwner } = require('../middleware/roleCheck');

router.use(protect);

router.post('/', requireRole('admin'), ctrl.createGrade);
router.put('/:id', requireRole('admin'), ctrl.updateGrade);
router.delete('/:id', requireRole('admin'), ctrl.deleteGrade);
router.get('/my-grades', requireRole('student', 'admin'), ctrl.getMyReportCard);
router.get('/student/:id', requireAdminOrOwner(ctrl.getOwnerIdForGradeRoute), ctrl.getStudentReportCard);

module.exports = router;
