const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  content: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true // Cloudinary URL
  }
});

const testimonialSectionSchema = new mongoose.Schema({
  sectionHeading: {
    type: String,
    required: true
  },
  sectionDescription: {
    type: String,
    required: true
  },
  testimonials: [testimonialSchema]
});

module.exports = mongoose.model('TestimonialSection', testimonialSectionSchema);
