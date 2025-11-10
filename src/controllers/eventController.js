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
      image,
      imageKey
    } = req.body;
    
    // Determine final image URL and key. Frontend may send image (URL) and imageKey after uploading via upload API.
    let finalImageUrl = '';
    let finalImageKey = '';

    if (req.file) {
      // File uploaded directly - upload to Antryk
      const { v4: uuidv4 } = require('uuid');
      const imageData = req.file;
      const key = `events/${uuidv4()}_${imageData.originalname || 'image'}`;
      const uploadResult = await uploadToAntryk(imageData, key);
      finalImageUrl = uploadResult.url || uploadResult.fileUrl || '';
      finalImageKey = uploadResult.key || uploadResult.objectKey || '';
    } else {
      // Frontend already uploaded and provided URL/key
      if (image) finalImageUrl = image;
      if (imageKey) finalImageKey = imageKey;
    }

    const event = await Event.create({
      title,
      shortDescription,
      description,
      startDate,
      endDate,
      location,
      venueDetails,
      image: finalImageUrl,
      imageKey: finalImageKey,
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
    // Accept possible image URL/key from frontend, or a file in req.file
    const { image, imageKey, ...otherFields } = req.body;
    let updateData = { ...otherFields };

    if (req.file) {
      // File uploaded - upload to Antryk and replace
      const { v4: uuidv4 } = require('uuid');
      const imageData = req.file;

      // Delete old image from Antryk if present
      if (event.imageKey) {
        try {
          await deleteFromAntryk(event.imageKey);
        } catch (err) {
          console.error('Failed to delete old image from Antryk:', err.message);
        }
      }

      const key = `events/${uuidv4()}_${imageData.originalname || 'image'}`;
      const uploadResult = await uploadToAntryk(imageData, key);
      updateData.image = uploadResult.url || uploadResult.fileUrl || '';
      updateData.imageKey = uploadResult.key || uploadResult.objectKey || '';
    } else {
      // No file uploaded - accept provided image and imageKey
      if (image !== undefined) updateData.image = image;
      if (imageKey !== undefined) {
        // If replacing key, delete old object
        if (event.imageKey && event.imageKey !== imageKey) {
          try {
            await deleteFromAntryk(event.imageKey);
          } catch (err) {
            console.error('Failed to delete old image from Antryk:', err.message);
          }
        }
        updateData.imageKey = imageKey;
      }
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
