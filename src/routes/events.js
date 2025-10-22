const express = require('express');
const router = express.Router();
const { getAllEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/auth');

// GET all events
router.get('/', getAllEvents);

// POST create event
router.post('/', protect, adminOnly, createEvent);

// PUT update event
router.put('/:id', protect, adminOnly, updateEvent);

// DELETE event
router.delete('/:id', protect, adminOnly, deleteEvent);

module.exports = router;
