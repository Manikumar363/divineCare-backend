const express = require('express');
const router = express.Router();
const { getHome, updateHome } = require('../../controllers/Home/homeController');
const { protect, adminOnly } = require('../../middleware/auth');

// GET home page data
router.get('/', getHome);


const upload = require('../../middleware/multer');
// PUT update home page
router.put('/:id', protect, adminOnly, upload.single('image'), updateHome);


module.exports = router;
