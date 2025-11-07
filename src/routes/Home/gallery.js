const express = require('express');
const router = express.Router();
const { getGallery, updateGallery, createGallery } = require('../../controllers/Home/galleryController');
const { protect, adminOnly } = require('../../middleware/auth');

// GET gallery data
router.get('/', getGallery);

// POST create gallery data

const upload = require('../../middleware/multer');
// PUT update gallery data
router.put('/:id', protect, adminOnly, upload.single('image'), updateGallery);

module.exports = router;
// Removed POST route for creating gallery data
