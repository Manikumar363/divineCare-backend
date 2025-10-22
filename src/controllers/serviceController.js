const Service = require('../models/Service');

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
    let imageUrl = image;
    if (req.file && req.file.path) {
      imageUrl = req.file.path;
    }
    const service = new Service({ title, shortDescription, detailedDescription, image: imageUrl });
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
    let updateData = { title, shortDescription, detailedDescription };
    if (req.file && req.file.path) {
      updateData.image = req.file.path;
    } else if (image) {
      updateData.image = image;
    }
    const service = await Service.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error updating service', error });
  }
};

// Delete a service
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting service', error });
  }
};
