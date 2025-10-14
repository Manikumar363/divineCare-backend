const express = require('express');
const router = express.Router();
const { getHome, updateHome } = require('../../controllers/Home/homeController');
const { protect, adminOnly } = require('../../middleware/auth');

// GET home page data
router.get('/', protect, adminOnly, getHome);


// PUT update home page
router.put('/:id', protect, adminOnly, updateHome);


module.exports = router;
