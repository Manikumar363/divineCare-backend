const Service = require('../models/Service');
const { uploadToAntryk, deleteFromAntryk } = require('../utils/cloudinaryHelper');
const { v4: uuidv4 } = require('uuid');

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services', error });
  }
};

// Get a single service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service', error });
  }
};

// Create a new service
exports.createService = async (req, res) => {
  try {
    const { title, shortDescription, detailedDescription } = req.body;

    let image1Url = '';
    let image1Key = '';
    let image2Url = '';
    let image2Key = '';

    // Handle two image uploads with UUID-based keys
    // Priority: if files are provided (multipart upload), use them.
    // Otherwise accept direct URL/key values in the request body (from separate upload endpoint).
    if (req.files && req.files.image1 && req.files.image1[0]) {
      const key1 = `services/${uuidv4()}_${req.files.image1[0].originalname}`;
      const uploadResult1 = await uploadToAntryk(req.files.image1[0], key1);
      image1Url = uploadResult1.url;
      image1Key = uploadResult1.key;
    } else if (req.body && req.body.image1) {
      image1Url = req.body.image1;
      // Accept either image1Key or image1PublicId from the frontend
      image1Key = req.body.image1Key || req.body.image1PublicId || '';
    }

    if (req.files && req.files.image2 && req.files.image2[0]) {
      const key2 = `services/${uuidv4()}_${req.files.image2[0].originalname}`;
      const uploadResult2 = await uploadToAntryk(req.files.image2[0], key2);
      image2Url = uploadResult2.url;
      image2Key = uploadResult2.key;
    } else if (req.body && req.body.image2) {
      image2Url = req.body.image2;
      image2Key = req.body.image2Key || req.body.image2PublicId || '';
    }

    const service = new Service({
      title,
      shortDescription,
      detailedDescription,
      image1: image1Url,
      image1Key,
      image2: image2Url,
      image2Key
    });
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    console.error('Service creation error:', error); // Add this line
    res.status(500).json({ message: 'Error creating service', error });
  }
};

// Update a service
exports.updateService = async (req, res) => {
  try {
    const { title, shortDescription, detailedDescription } = req.body;
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    let updateData = { title, shortDescription, detailedDescription };

    // If the frontend already uploaded images separately and passed URL/key in the body,
    // use those values and delete the old stored object (if different).
    if (req.body && req.body.image1) {
      const newKey = req.body.image1Key || req.body.image1PublicId || '';
      if (service.image1Key && newKey && service.image1Key !== newKey) {
        try {
          await deleteFromAntryk(service.image1Key);
        } catch (err) {
          // Log and continue; failure to delete old image shouldn't block update
          console.error('Failed to delete previous image1 key:', service.image1Key, err);
        }
      }
      updateData.image1 = req.body.image1;
      updateData.image1Key = newKey;
    }
    if (req.body && req.body.image2) {
      const newKey2 = req.body.image2Key || req.body.image2PublicId || '';
      if (service.image2Key && newKey2 && service.image2Key !== newKey2) {
        try {
          await deleteFromAntryk(service.image2Key);
        } catch (err) {
          console.error('Failed to delete previous image2 key:', service.image2Key, err);
        }
      }
      updateData.image2 = req.body.image2;
      updateData.image2Key = newKey2;
    }

    // Handle image1 update with UUID-based key
    if (req.files && req.files.image1 && req.files.image1[0]) {
      if (service.image1Key) {
        await deleteFromAntryk(service.image1Key);
      }
      const key1 = `services/${uuidv4()}_${req.files.image1[0].originalname}`;
      const uploadResult1 = await uploadToAntryk(req.files.image1[0], key1);
      updateData.image1 = uploadResult1.url;
      updateData.image1Key = uploadResult1.key;
    }
    // Handle image2 update with UUID-based key
    if (req.files && req.files.image2 && req.files.image2[0]) {
      if (service.image2Key) {
        await deleteFromAntryk(service.image2Key);
      }
      const key2 = `services/${uuidv4()}_${req.files.image2[0].originalname}`;
      const uploadResult2 = await uploadToAntryk(req.files.image2[0], key2);
      updateData.image2 = uploadResult2.url;
      updateData.image2Key = uploadResult2.key;
    }

    const updatedService = await Service.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json(updatedService);
  } catch (error) {
    res.status(500).json({ message: 'Error updating service', error });
  }
};

// Delete a service
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    
    // Delete uploaded objects from Antryk before removing service (if keys present)
    try {
      if (service.image1Key) {
        await deleteFromAntryk(service.image1Key);
      }
    } catch (err) {
      console.error('Failed to delete image1 during service deletion:', err);
    }
    try {
      if (service.image2Key) {
        await deleteFromAntryk(service.image2Key);
      }
    } catch (err) {
      console.error('Failed to delete image2 during service deletion:', err);
    }
    
    await Service.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting service', error });
  }
};
