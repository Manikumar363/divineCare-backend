const express = require('express');
const router = express.Router();
const { getHome, createHome, updateHome, deleteHome } = require('../controllers/homeController');
const { protect, adminOnly } = require('../middleware/auth');

// GET home page data
router.get('/', protect, adminOnly, getHome);

// POST create home page
router.post('/', protect, adminOnly, createHome);

// PUT update home page
router.put('/:id', protect, adminOnly, updateHome);

// DELETE home page
router.delete('/:id', protect, adminOnly, deleteHome);

module.exports = router;
