const TestimonialSection = require('../../models/Home/TestimonialSection');
const cloudinary = require('../../config/cloudinary');

// Edit a testimonial by id
exports.editTestimonial = async (req, res) => {
  try {
    const { testimonialId } = req.params;
    const { rating, content, name, designation, image } = req.body;
    let section = await TestimonialSection.findOne();
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    const testimonial = section.testimonials.id(testimonialId);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    if (rating !== undefined) testimonial.rating = rating;
    if (content !== undefined) testimonial.content = content;
    if (name !== undefined) testimonial.name = name;
    if (designation !== undefined) testimonial.designation = designation;
    if (image !== undefined) testimonial.image = image;
    await section.save();
    res.json(section);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get section header and all testimonials
exports.getTestimonialSection = async (req, res) => {
  try {
    const section = await TestimonialSection.findOne();
    res.json(section);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Create or update section header and testimonials
exports.upsertTestimonialSection = async (req, res) => {
  try {
    const { sectionHeading, sectionDescription, testimonials } = req.body;
    let section = await TestimonialSection.findOne();
    if (section) {
      if (sectionHeading !== undefined) section.sectionHeading = sectionHeading;
      if (sectionDescription !== undefined) section.sectionDescription = sectionDescription;
      if (Array.isArray(testimonials) && testimonials.length > 0) {
        // Append new testimonials to existing ones
        section.testimonials = section.testimonials.concat(testimonials);
      }
      await section.save();
    } else {
      section = await TestimonialSection.create({
        sectionHeading,
        sectionDescription,
        testimonials: Array.isArray(testimonials) ? testimonials : []
      });
    }
    res.json(section);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add a single testimonial (with image upload)
exports.addTestimonial = async (req, res) => {
  try {
    const { rating, content, name, designation } = req.body;
    let imageUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    }
    const testimonial = {
      rating,
      content,
      name,
      designation,
      image: imageUrl
    };
    let section = await TestimonialSection.findOne();
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    section.testimonials.push(testimonial);
    await section.save();
    res.json(section);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a testimonial by id
exports.deleteTestimonial = async (req, res) => {
  try {
    const { testimonialId } = req.params;
    let section = await TestimonialSection.findOne();
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    const initialLength = section.testimonials.length;
    section.testimonials = section.testimonials.filter(t => t._id.toString() !== testimonialId);
    if (section.testimonials.length === initialLength) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    await section.save();
    res.json(section);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
