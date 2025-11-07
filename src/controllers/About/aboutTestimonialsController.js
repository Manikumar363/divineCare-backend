const AboutTestimonials = require('../../models/About/aboutTestimonials');
const { uploadToAntryk, deleteFromAntryk } = require('../../utils/cloudinaryHelper');

// GET section content and all testimonials
exports.getAboutTestimonials = async (req, res) => {
  try {
    const about = await AboutTestimonials.findOne();
    res.status(200).json({ success: true, about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update section content and all testimonials (bulk)
exports.updateAboutTestimonials = async (req, res) => {
  try {
    const about = await AboutTestimonials.findById(req.params.id);
    if (!about) return res.status(404).json({ success: false, message: 'About Testimonials section not found' });
    
    const { sectionHeading, sectionDescription, sectionImage, statistics, testimonials } = req.body;
    
    // Handle section image update if provided
    if (sectionImage || req.file) {
      const { v4: uuidv4 } = require('uuid');
      const imageData = req.file || sectionImage;
      const key = `about-testimonials/${uuidv4()}_${imageData.originalname || 'image'}`;
      const uploadResult = await uploadToAntryk(imageData, key);
      about.sectionImageKey = uploadResult.key;
    }
    
    // Update other fields
    if (sectionHeading !== undefined) about.sectionHeading = sectionHeading;
    if (sectionDescription !== undefined) about.sectionDescription = sectionDescription;
    if (statistics !== undefined) about.statistics = statistics;
    if (testimonials !== undefined) {
      // Ensure each testimonial has a proper _id when updating the array
      const processedTestimonials = testimonials.map(testimonial => {
        if (!testimonial._id) {
          // Generate new ObjectId if _id is missing
          const mongoose = require('mongoose');
          testimonial._id = new mongoose.Types.ObjectId();
        }
        return testimonial;
      });
      about.testimonials = processedTestimonials;
    }
    
    await about.save();
    res.status(200).json({ success: true, about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST add a new testimonial
exports.addTestimonial = async (req, res) => {
  try {
    const { image, rating, name, title, content } = req.body;
    const about = await AboutTestimonials.findOne();
    if (!about) return res.status(404).json({ success: false, message: 'About Testimonials section not found' });
    
    // Handle image upload to Antryk
    let imageKey = '';
    if (image || req.file) {
      const { v4: uuidv4 } = require('uuid');
      const imageData = req.file || image;
      const key = `testimonials/${uuidv4()}_${imageData.originalname || 'image'}`;
      const uploadResult = await uploadToAntryk(imageData, key);
      imageKey = uploadResult.key;
    }

    const mongoose = require('mongoose');
    about.testimonials.push({ 
      _id: new mongoose.Types.ObjectId(), // Ensure proper ObjectId
      imageKey, 
      rating, 
      name, 
      title, 
      content 
    });
    await about.save();
    res.status(201).json({ success: true, about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update a specific testimonial
exports.updateTestimonial = async (req, res) => {
  try {
    const about = await AboutTestimonials.findOne();
    if (!about) return res.status(404).json({ success: false, message: 'About Testimonials section not found' });
    const testimonial = about.testimonials.id(req.params.testimonialId);
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    
    const { image, rating, name, title, content } = req.body;
    
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
    if (name !== undefined) testimonial.name = name;
    if (title !== undefined) testimonial.title = title;
    if (content !== undefined) testimonial.content = content;
    
    await about.save();
    res.status(200).json({ success: true, about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE a specific testimonial
exports.deleteTestimonial = async (req, res) => {
  try {
    const about = await AboutTestimonials.findOne();
    if (!about) return res.status(404).json({ success: false, message: 'About Testimonials section not found' });
    const index = about.testimonials.findIndex(t => t._id.toString() === req.params.testimonialId);
    if (index === -1) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    
    // Delete image from Antryk before removing testimonial
    const testimonial = about.testimonials[index];
    if (testimonial.imageKey) {
      const { deleteFromAntryk } = require('../../utils/cloudinaryHelper');
      try {
        await deleteFromAntryk(testimonial.imageKey);
      } catch (err) {
        console.error('Failed to delete image from Antryk:', err.message);
      }
    }

    about.testimonials.splice(index, 1);
    await about.save();
    res.status(200).json({ success: true, about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
