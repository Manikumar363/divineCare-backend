const TestimonialSection = require('../../models/Home/TestimonialSection');
const { uploadToAntryk, deleteFromAntryk } = require('../../utils/cloudinaryHelper');

// GET section header and all testimonials
exports.getTestimonialSection = async (req, res) => {
  try {
    const section = await TestimonialSection.findOne();
    res.status(200).json({ success: true, section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update section header and all testimonials (bulk)
exports.updateTestimonialSection = async (req, res) => {
  try {
    const section = await TestimonialSection.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!section) return res.status(404).json({ success: false, message: 'Testimonial section not found' });
    res.status(200).json({ success: true, section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST add a new testimonial
exports.addTestimonial = async (req, res) => {
  try {
    const { rating, content, name, designation, image } = req.body;
    const section = await TestimonialSection.findOne();
    if (!section) return res.status(404).json({ success: false, message: 'Testimonial section not found' });
    
    // Handle image upload to Antryk
    let imageKey = '';
    if (image || req.file) {
      const { v4: uuidv4 } = require('uuid');
      const imageData = req.file || image;
      const key = `testimonials/${uuidv4()}_${imageData.originalname || 'image'}`;
      const uploadResult = await uploadToAntryk(imageData, key);
      imageKey = uploadResult.key;
    }
    section.testimonials.push({ 
      rating, 
      content, 
      name, 
      designation, 
      imageKey 
    });
    await section.save();
    res.status(201).json({ success: true, section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update a specific testimonial
exports.updateTestimonial = async (req, res) => {
  try {
    const section = await TestimonialSection.findOne();
    if (!section) return res.status(404).json({ success: false, message: 'Testimonial section not found' });
    const testimonial = section.testimonials.id(req.params.testimonialId);
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    
    const { image, rating, content, name, designation } = req.body;
    
    // Handle image update if provided
    if (image || req.file) {
      const { v4: uuidv4 } = require('uuid');
      const imageData = req.file || image;
      // Delete old image from Antryk if present
      if (testimonial.imageKey) {
        const { deleteFromAntryk } = require('../../utils/cloudinaryHelper');
        try {
          await deleteFromAntryk(testimonial.imageKey);
        } catch (err) {
          console.error('Failed to delete old image from Antryk:', err.message);
        }
      }
      const key = `testimonials/${uuidv4()}_${imageData.originalname || 'image'}`;
      const uploadResult = await uploadToAntryk(imageData, key);
      testimonial.imageKey = uploadResult.key;
    }
    
    // Update other fields
    if (rating !== undefined) testimonial.rating = rating;
    if (content !== undefined) testimonial.content = content;
    if (name !== undefined) testimonial.name = name;
    if (designation !== undefined) testimonial.designation = designation;
    
    await section.save();
    res.status(200).json({ success: true, section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE a specific testimonial
exports.deleteTestimonial = async (req, res) => {
  try {
    const section = await TestimonialSection.findOne();
    if (!section) return res.status(404).json({ success: false, message: 'Testimonial section not found' });
    const index = section.testimonials.findIndex(t => t._id.toString() === req.params.testimonialId);
    if (index === -1) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    
    // Delete image from Antryk before removing testimonial
    const testimonial = section.testimonials[index];
    if (testimonial.imageKey) {
      const { deleteFromAntryk } = require('../../utils/cloudinaryHelper');
      try {
        await deleteFromAntryk(testimonial.imageKey);
      } catch (err) {
        console.error('Failed to delete image from Antryk:', err.message);
      }
    }

    section.testimonials.splice(index, 1);
    await section.save();
    res.status(200).json({ success: true, section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
