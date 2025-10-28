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
    const { title, shortDescription, detailedDescription, image } = req.body;
    
    // Handle image upload to Cloudinary
    let imageUrl = '';
    let imagePublicId = '';
    
    if (image || req.file) {
      const imageData = req.file || image;
      const uploadResult = await uploadToCloudinary(imageData, 'divinecare/services');
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }
    
    const service = new Service({ 
      title, 
      shortDescription, 
      detailedDescription, 
      image: imageUrl,
      imagePublicId 
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
    const { title, shortDescription, detailedDescription, image } = req.body;
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    
    let updateData = { title, shortDescription, detailedDescription };
    
    // Handle image update if provided
    if (image || req.file) {
      const imageData = req.file || image;
      const oldPublicId = service.imagePublicId;
      const uploadResult = await uploadToCloudinary(imageData, 'divinecare/services', oldPublicId);
      updateData.image = uploadResult.secure_url;
      updateData.imagePublicId = uploadResult.public_id;
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
