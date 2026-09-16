const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/announcementController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.use(protect);

router.get('/', ctrl.listAnnouncements); // admin & student
router.post('/', requireRole('admin'), ctrl.createAnnouncement);
router.put('/:id', requireRole('admin'), ctrl.updateAnnouncement);
router.delete('/:id', requireRole('admin'), ctrl.deleteAnnouncement);

module.exports = router;
