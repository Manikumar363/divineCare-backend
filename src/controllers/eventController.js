const Event = require('../models/Event');
const { uploadToAntryk, deleteFromAntryk } = require('../utils/cloudinaryHelper');

// GET all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ startDate: -1 });
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST create event
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      description,
      startDate,
      endDate,
      location,
      venueDetails,
      image
    } = req.body;
    
    // Handle image upload to Antryk
    let imageKey = '';
    if (image || req.file) {
      const { v4: uuidv4 } = require('uuid');
      const imageData = req.file || image;
      const key = `events/${uuidv4()}_${imageData.originalname || 'image'}`;
      const uploadResult = await uploadToAntryk(imageData, key);
      imageKey = uploadResult.key;
    }
    const event = await Event.create({
      title,
      shortDescription,
      description,
      startDate,
      endDate,
      location,
      venueDetails,
      imageKey,
      createdBy: req.user._id
    });
    res.status(201).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    const { image, ...otherFields } = req.body;
    let updateData = { ...otherFields };
    
    // Handle image update if provided
    if (image || req.file) {
      const { v4: uuidv4 } = require('uuid');
      const imageData = req.file || image;
      // Delete old image from Antryk if present
      if (event.imageKey) {
        const { deleteFromAntryk } = require('../utils/cloudinaryHelper');
        try {
          await deleteFromAntryk(event.imageKey);
        } catch (err) {
          console.error('Failed to delete old image from Antryk:', err.message);
        }
      }
      const key = `events/${uuidv4()}_${imageData.originalname || 'image'}`;
      const { uploadToAntryk } = require('../utils/cloudinaryHelper');
      const uploadResult = await uploadToAntryk(imageData, key);
      updateData.imageKey = uploadResult.key;
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json({ success: true, event: updatedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    // Delete image from Antryk before removing event
    if (event.imageKey) {
      const { deleteFromAntryk } = require('../utils/cloudinaryHelper');
      try {
        await deleteFromAntryk(event.imageKey);
      } catch (err) {
        console.error('Failed to delete image from Antryk:', err.message);
      }
    }

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST register for an event (public)
exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const { firstName, lastName, email } = req.body;
    if (!firstName || !email) return res.status(400).json({ success: false, message: 'firstName and email are required' });

    const registration = {
      firstName,
      lastName,
      email,
      createdAt: new Date()
    };

    event.registrations.push(registration);
    await event.save();

    res.status(201).json({ success: true, message: 'Registered for event', registration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET registrations for an event (admin)
exports.getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).select('title registrations');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.status(200).json({ success: true, registrations: event.registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
