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
    if (req.files && req.files.image1 && req.files.image1[0]) {
      const key1 = `services/${uuidv4()}_${req.files.image1[0].originalname}`;
      const uploadResult1 = await uploadToAntryk(req.files.image1[0], key1);
      image1Url = uploadResult1.url;
      image1Key = uploadResult1.key;
    }
    if (req.files && req.files.image2 && req.files.image2[0]) {
      const key2 = `services/${uuidv4()}_${req.files.image2[0].originalname}`;
      const uploadResult2 = await uploadToAntryk(req.files.image2[0], key2);
      image2Url = uploadResult2.url;
      image2Key = uploadResult2.key;
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
    
    // Delete image from Cloudinary before removing service
    if (service.imagePublicId) {
      await deleteFromCloudinary(service.imagePublicId);
    }
    
    await Service.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting service', error });
  }
};
