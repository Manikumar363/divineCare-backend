const express = require('express');
const router = express.Router();
const { getAbout, createAbout, updateAbout, deleteAbout } = require('../controllers/aboutController');
const { protect, adminOnly } = require('../middleware/auth');

// GET about section data
router.get('/', protect, adminOnly, getAbout);

// POST create about section
router.post('/', protect, adminOnly, createAbout);

// PUT update about section
router.put('/:id', protect, adminOnly, updateAbout);

// DELETE about section
router.delete('/:id', protect, adminOnly, deleteAbout);

module.exports = router;
