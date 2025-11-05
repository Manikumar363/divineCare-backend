const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { createUser } = require('../controllers/userController');

// Admin routes
router.post('/create', protect, adminOnly, createUser);

module.exports = router;