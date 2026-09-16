const express = require('express');
const router = express.Router();
const { upload, handleUpload } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

router.post('/', protect, upload.single('file'), handleUpload);

module.exports = router;
