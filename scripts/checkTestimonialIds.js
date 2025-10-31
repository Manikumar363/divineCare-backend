const mongoose = require('mongoose');
const AboutTestimonials = require('../src/models/About/aboutTestimonials');
require('dotenv').config();

async function checkTestimonialIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const about = await AboutTestimonials.findOne();
    
    if (!about) {
      console.log('No document found');
      return;
    }

    console.log('✅ Fixed! Testimonials now have proper IDs:');
    about.testimonials.forEach((testimonial, index) => {
      console.log(`${index + 1}. ${testimonial.name} - ID: ${testimonial._id}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkTestimonialIds();