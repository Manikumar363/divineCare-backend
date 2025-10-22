const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { protect, adminOnly } = require('../middleware/auth');

// GET all stories (public)
router.get('/', storyController.getAllStories);

// GET a single story by ID (public)
router.get('/:id', storyController.getStoryById);

// POST create a new story (admin only)
router.post('/', protect, adminOnly, storyController.createStory);

// PUT update a story (admin only)
router.put('/:id', protect, adminOnly, storyController.updateStory);

// DELETE a story (admin only)
router.delete('/:id', protect, adminOnly, storyController.deleteStory);

module.exports = router;
