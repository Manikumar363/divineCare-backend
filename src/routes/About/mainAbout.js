const express = require('express');
const router = express.Router();
const { getMainAbout, updateMainAbout } = require('../../controllers/About/mainAboutController');
const { protect, adminOnly } = require('../../middleware/auth');

// GET main about section data
router.get('/', getMainAbout);

const upload = require('../../middleware/multer');
// PUT update main about section data
router.put('/:id', protect, adminOnly, upload.single('image'), updateMainAbout);

module.exports = router;
