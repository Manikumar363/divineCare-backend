const express = require('express');
const router = express.Router();
const { getVisionAbout, updateVisionAbout } = require('../../controllers/About/visionAboutController');
const { protect, adminOnly } = require('../../middleware/auth');

// GET vision about section data
router.get('/', getVisionAbout);

// PUT update vision about section data
router.put('/:id', protect, adminOnly, updateVisionAbout);

module.exports = router;
