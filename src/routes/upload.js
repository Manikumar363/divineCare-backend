const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { uploadFile, uploadPublicFile } = require('../controllers/uploadController');
const { protect, adminOnly } = require('../middleware/auth'); // Optional: protect route

// Admin upload (multiple files)
router.post('/', protect, adminOnly, upload.array('files', 10), uploadFile);

// Public single-file upload (used by users). Field name: 'file'
router.post('/public', upload.single('file'), uploadPublicFile);

module.exports = router;