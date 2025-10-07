const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { uploadFile } = require('../controllers/uploadController');
const { protect, adminOnly } = require('../middleware/auth'); // Optional: protect route

router.post('/', protect, adminOnly, upload.array('files', 10), uploadFile);

module.exports = router;