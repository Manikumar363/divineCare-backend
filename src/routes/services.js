const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const upload = require('../middleware/multer');
const { protect, adminOnly } = require('../middleware/auth');


// GET all services
router.get('/', serviceController.getAllServices);

// GET a single service by ID
router.get('/:id', serviceController.getServiceById);

// POST create a new service
router.post('/', protect, adminOnly, upload.fields([
	{ name: 'image1', maxCount: 1 },
	{ name: 'image2', maxCount: 1 }
]), serviceController.createService);

// PUT update a service
router.put('/:id', protect, adminOnly, upload.fields([
	{ name: 'image1', maxCount: 1 },
	{ name: 'image2', maxCount: 1 }
]), serviceController.updateService);

// DELETE a service
router.delete('/:id', protect, adminOnly, serviceController.deleteService);

module.exports = router;
