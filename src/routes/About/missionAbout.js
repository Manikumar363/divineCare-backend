const express = require('express');
const router = express.Router();
const { getMissionAbout, updateMissionAbout } = require('../../controllers/About/missionAboutController');
const { protect, adminOnly } = require('../../middleware/auth');

// GET mission about section data
router.get('/', protect, adminOnly, getMissionAbout);

// PUT update mission about section data
router.put('/:id', protect, adminOnly, updateMissionAbout);

module.exports = router;
