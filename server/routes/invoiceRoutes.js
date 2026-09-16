const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');
const { requireRole, requireAdminOrOwner } = require('../middleware/roleCheck');

router.use(protect);

router.get('/', requireRole('admin'), ctrl.listInvoices);
router.post('/', requireRole('admin'), ctrl.createInvoice);
router.post('/:id/payments', requireRole('admin', 'student'), ctrl.recordPayment);
router.post('/:id/payment', requireRole('admin', 'student'), ctrl.recordPayment);
router.get('/my-invoices', requireRole('student', 'admin'), ctrl.getMyInvoices);
router.get('/student/:id', requireAdminOrOwner(ctrl.getOwnerIdForInvoiceRoute), ctrl.getStudentInvoices);

module.exports = router;
