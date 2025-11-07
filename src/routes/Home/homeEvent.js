const express = require('express');
const router = express.Router();
const { getHomeEvent, updateHomeEvent } = require('../../controllers/Home/homeEventController');
const { protect, adminOnly } = require('../../middleware/auth');

// GET home event section data
router.get('/', getHomeEvent);

const upload = require('../../middleware/multer');
// PUT update home event section data
router.put('/:id', protect, adminOnly, upload.single('image'), updateHomeEvent);

module.exports = router;
