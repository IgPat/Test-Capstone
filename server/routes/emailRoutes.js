const express = require('express');
const router = express.Router();
const { createUser, sendEmail } = require('../controllers/emailController');

router.post('/create', createUser);
router.post('/send', sendEmail);

module.exports = router;