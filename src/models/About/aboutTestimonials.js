const mongoose = require('mongoose');

const statisticSchema = new mongoose.Schema({
  number: { type: String, required: true },
  label: { type: String, required: true }
}, { _id: false });

const testimonialSchema = new mongoose.Schema({
  image: { type: String, required: true }, // Cloudinary secure_url
  imagePublicId: { type: String }, // Cloudinary public_id for deletion
  rating: { type: Number, required: true },
  name: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true }
}, { _id: true });

const aboutTestimonialsSchema = new mongoose.Schema({
  sectionHeading: { type: String, required: true },
  sectionDescription: { type: String, required: true },
  sectionImage: { type: String }, // Cloudinary secure_url for section content
  sectionImagePublicId: { type: String }, // Cloudinary public_id for deletion
  statistics: [statisticSchema], // stat 1 and stat 2
  testimonials: [testimonialSchema]
}, { timestamps: true });

module.exports = mongoose.model('AboutTestimonials', aboutTestimonialsSchema);
