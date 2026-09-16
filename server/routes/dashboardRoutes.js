const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.use(protect);

router.get('/admin', requireRole('admin'), ctrl.adminDashboard);
router.get('/student', requireRole('student'), ctrl.studentDashboard);

module.exports = router;
