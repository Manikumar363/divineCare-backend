const express = require('express');
const router = express.Router();
const { getAboutTestimonials, updateAboutTestimonials, addTestimonial, updateTestimonial, deleteTestimonial } = require('../../controllers/About/aboutTestimonialsController');
const { protect, adminOnly } = require('../../middleware/auth');
const upload = require('../../middleware/multer');

// GET section content and all testimonials
router.get('/', getAboutTestimonials);

// PUT update section content and all testimonials (bulk)
router.put('/:id', protect, adminOnly, upload.single('sectionImage'), updateAboutTestimonials);

// POST add a new testimonial
router.post('/testimonial', protect, adminOnly, upload.single('image'), addTestimonial);

// PUT update a specific testimonial
router.put('/testimonial/:testimonialId', protect, adminOnly, upload.single('image'), updateTestimonial);

// DELETE a specific testimonial
router.delete('/testimonial/:testimonialId', protect, adminOnly, deleteTestimonial);

module.exports = router;
