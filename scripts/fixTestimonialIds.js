const mongoose = require('mongoose');
const AboutTestimonials = require('../src/models/About/aboutTestimonials');
require('dotenv').config();

async function fixTestimonialIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the AboutTestimonials document
    const about = await AboutTestimonials.findOne();
    if (!about) {
      console.log('No AboutTestimonials document found');
      return;
    }

    console.log('Current testimonials:', about.testimonials.length);
    
    // Check if any testimonials have null or missing _id
    let needsUpdate = false;
    about.testimonials.forEach((testimonial, index) => {
      if (!testimonial._id) {
        console.log(`Testimonial ${index} has null _id`);
        testimonial._id = new mongoose.Types.ObjectId();
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      // Save the document to update the IDs
      await about.save();
      console.log('✅ Successfully updated testimonial IDs');
      
      // Verify the update
      const updated = await AboutTestimonials.findOne();
      console.log('Updated testimonials:');
      updated.testimonials.forEach((testimonial, index) => {
        console.log(`  ${index}: ${testimonial._id} - ${testimonial.name}`);
      });
    } else {
      console.log('All testimonials already have valid IDs');
    }

  } catch (error) {
    console.error('Error fixing testimonial IDs:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

fixTestimonialIds();