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
    required: true // Antryk file URL
  },
  imageKey: {
    type: String // Antryk object key
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
}, { timestamps: true });

module.exports = mongoose.model('TestimonialSection', testimonialSectionSchema);
