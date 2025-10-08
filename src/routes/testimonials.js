const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const upload = require('../middleware/multer');
const auth = require('../middleware/auth');

// Get section header and all testimonials
router.get('/', testimonialController.getTestimonialSection);

// Create or update section header and testimonials (admin only)
router.post('/', auth.protect, auth.adminOnly, testimonialController.upsertTestimonialSection);

// Edit a testimonial by id (admin only)
router.put('/:testimonialId', auth.protect, auth.adminOnly, testimonialController.editTestimonial);

// Delete a testimonial by id (admin only)
router.delete('/:testimonialId', auth.protect, auth.adminOnly, testimonialController.deleteTestimonial);

module.exports = router;
