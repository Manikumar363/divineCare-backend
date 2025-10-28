const express = require('express');
const router = express.Router();
const testimonialController = require('../../controllers/Home/testimonialController');
const auth = require('../../middleware/auth');
const upload = require('../../middleware/multer');

// Get section header and all testimonials
router.get('/', testimonialController.getTestimonialSection);

// PUT update section header and all testimonials (bulk)
router.put('/:id', auth.protect, auth.adminOnly, testimonialController.updateTestimonialSection);

// POST add a new testimonial
router.post('/testimonial', auth.protect, auth.adminOnly, upload.single('image'), testimonialController.addTestimonial);

// PUT update a specific testimonial
router.put('/testimonial/:testimonialId', auth.protect, auth.adminOnly, upload.single('image'), testimonialController.updateTestimonial);

// DELETE a specific testimonial
router.delete('/testimonial/:testimonialId', auth.protect, auth.adminOnly, testimonialController.deleteTestimonial);

module.exports = router;
