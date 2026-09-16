// Simple local-disk upload for profile photos / documents (Multer).
// Swap the multer storage engine for multer-storage-cloudinary to use Cloudinary instead -
// see the README for the two-line change required.
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
  if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
  else cb(new Error('Unsupported file type'));
};

exports.upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/uploads - returns a URL the client can save onto photoUrl, etc.
exports.handleUpload = (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(201).json({ url });
};
