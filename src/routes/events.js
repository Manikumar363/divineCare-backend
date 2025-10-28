const express = require('express');
const router = express.Router();
const { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/multer');

// GET all events
router.get('/', getAllEvents);

// GET single event by ID
router.get('/:id', getEventById);

// POST create event
router.post('/', protect, adminOnly, upload.single('image'), createEvent);

// PUT update event
router.put('/:id', protect, adminOnly, upload.single('image'), updateEvent);

// DELETE event
router.delete('/:id', protect, adminOnly, deleteEvent);

module.exports = router;
