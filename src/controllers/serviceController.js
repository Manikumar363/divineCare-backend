const Service = require('../models/Service');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryHelper');

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
    let image1PublicId = '';
    let image2Url = '';
    let image2PublicId = '';

    // Handle two image uploads
    if (req.files && req.files.image1 && req.files.image1[0]) {
      const uploadResult1 = await uploadToCloudinary(req.files.image1[0], 'divinecare/services');
      image1Url = uploadResult1.secure_url;
      image1PublicId = uploadResult1.public_id;
    }
    if (req.files && req.files.image2 && req.files.image2[0]) {
      const uploadResult2 = await uploadToCloudinary(req.files.image2[0], 'divinecare/services');
      image2Url = uploadResult2.secure_url;
      image2PublicId = uploadResult2.public_id;
    }

    const service = new Service({
      title,
      shortDescription,
      detailedDescription,
      image1: image1Url,
      image1PublicId,
      image2: image2Url,
      image2PublicId
    });
    await service.save();
    res.status(201).json(service);
  } catch (error) {
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

    // Handle image1 update
    if (req.files && req.files.image1 && req.files.image1[0]) {
      if (service.image1PublicId) {
        await deleteFromCloudinary(service.image1PublicId);
      }
      const uploadResult1 = await uploadToCloudinary(req.files.image1[0], 'divinecare/services');
      updateData.image1 = uploadResult1.secure_url;
      updateData.image1PublicId = uploadResult1.public_id;
    }
    // Handle image2 update
    if (req.files && req.files.image2 && req.files.image2[0]) {
      if (service.image2PublicId) {
        await deleteFromCloudinary(service.image2PublicId);
      }
      const uploadResult2 = await uploadToCloudinary(req.files.image2[0], 'divinecare/services');
      updateData.image2 = uploadResult2.secure_url;
      updateData.image2PublicId = uploadResult2.public_id;
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
