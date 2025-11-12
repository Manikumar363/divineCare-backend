const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { createUser, getTeamUsers, deleteUser} = require('../controllers/userController');


// Admin routes
router.post('/create', protect, adminOnly, createUser);

// GET all team users (role: user)
router.get('/team', protect, adminOnly, getTeamUsers);

// DELETE a team user
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;