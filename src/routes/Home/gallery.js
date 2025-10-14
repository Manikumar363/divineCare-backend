const express = require('express');
const router = express.Router();
const { getGallery, updateGallery, createGallery } = require('../../controllers/Home/galleryController');
const { protect, adminOnly } = require('../../middleware/auth');

// GET gallery data
router.get('/', protect, adminOnly, getGallery);

// POST create gallery data

// PUT update gallery data
router.put('/:id', protect, adminOnly, updateGallery);

module.exports = router;
// Removed POST route for creating gallery data
