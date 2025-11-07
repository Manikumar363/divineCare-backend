const express = require('express');
const router = express.Router();
const { getMissionAbout, updateMissionAbout } = require('../../controllers/About/missionAboutController');
const { protect, adminOnly } = require('../../middleware/auth');

// GET mission about section data
router.get('/', getMissionAbout);

const upload = require('../../middleware/multer');
// PUT update mission about section data
router.put('/:id', protect, adminOnly, upload.single('image'), updateMissionAbout);

module.exports = router;
