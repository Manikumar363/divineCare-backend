const express = require('express');
const router = express.Router();
const { getAbout, updateAbout } = require('../controllers/aboutController');
const { protect, adminOnly } = require('../middleware/auth');

// GET about section data
router.get('/', protect, adminOnly, getAbout);


// PUT update about section
router.put('/:id', protect, adminOnly, updateAbout);



module.exports = router;