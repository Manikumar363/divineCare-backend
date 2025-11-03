const Event = require('../models/Event');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryHelper');

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
    
    // Handle image upload to Cloudinary
    let imageUrl = '';
    let imagePublicId = '';
    
    if (image || req.file) {
      const imageData = req.file || image;
      const uploadResult = await uploadToCloudinary(imageData, 'divinecare/events');
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }
    
    const event = await Event.create({
      title,
      shortDescription,
      description,
      startDate,
      endDate,
      location,
      venueDetails,
      image: imageUrl,
      imagePublicId,
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
      const imageData = req.file || image;
      const oldPublicId = event.imagePublicId;
      const uploadResult = await uploadToCloudinary(imageData, 'divinecare/events', oldPublicId);
      updateData.image = uploadResult.secure_url;
      updateData.imagePublicId = uploadResult.public_id;
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
    
    // Delete image from Cloudinary before removing event
    if (event.imagePublicId) {
      await deleteFromCloudinary(event.imagePublicId);
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
