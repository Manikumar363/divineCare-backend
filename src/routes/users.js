const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { createUser, getTeamUsers } = require('../controllers/userController');


// Admin routes
router.post('/create', protect, adminOnly, createUser);

// GET all team users (role: user)
router.get('/team', protect, adminOnly, getTeamUsers);

module.exports = router;