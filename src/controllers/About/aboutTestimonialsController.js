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
    if (req.file) {
      // Actual file uploaded via multipart form - upload to Antryk
      const { v4: uuidv4 } = require('uuid');
      const imageData = req.file;
      const key = `about-testimonials/${uuidv4()}_${imageData.originalname || 'image'}`;
      const uploadResult = await uploadToAntryk(imageData, key);
      // uploadToAntryk should return both url and key — adapt to its shape
      about.sectionImage = uploadResult.url || uploadResult.fileUrl || '';
      about.sectionImageKey = uploadResult.key || uploadResult.objectKey || '';
    } else if (sectionImage !== undefined) {
      // Frontend provided a URL (or key-resolved URL) and optionally a sectionImageKey
      about.sectionImage = sectionImage;
      if (req.body.sectionImageKey !== undefined) about.sectionImageKey = req.body.sectionImageKey;
    }
    
    // Update other fields
    if (sectionHeading !== undefined) about.sectionHeading = sectionHeading;
    if (sectionDescription !== undefined) about.sectionDescription = sectionDescription;
    if (statistics !== undefined) about.statistics = statistics;
    if (testimonials !== undefined) {
      // Ensure each testimonial has a proper _id when updating the array
      const mongoose = require('mongoose');
      const processedTestimonials = testimonials.map(testimonial => {
        if (!testimonial._id) {
          // Generate new ObjectId if _id is missing
          testimonial._id = new mongoose.Types.ObjectId();
        }
        // Keep image and imageKey fields as provided by frontend. Don't re-upload here.
        // If frontend provided only imageKey and not image URL, frontend should provide image URL
        // or backend can construct it using your Antryk base URL elsewhere.
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
    // Accept either a previously-uploaded URL/key from frontend or an actual file via multipart
    const { image, imageKey, rating, name, title, content } = req.body;
    const about = await AboutTestimonials.findOne();
    if (!about) return res.status(404).json({ success: false, message: 'About Testimonials section not found' });
    
    // Determine final image URL and key
    let finalImageUrl = '';
    let finalImageKey = '';

    if (req.file) {
      // File uploaded directly - upload to Antryk
      const { v4: uuidv4 } = require('uuid');
      const imageData = req.file;
      const key = `testimonials/${uuidv4()}_${imageData.originalname || 'image'}`;
      const uploadResult = await uploadToAntryk(imageData, key);
      finalImageUrl = uploadResult.url || uploadResult.fileUrl || '';
      finalImageKey = uploadResult.key || uploadResult.objectKey || '';
    } else {
      // Frontend already uploaded and sent url/key
      if (image) finalImageUrl = image;
      if (imageKey) finalImageKey = imageKey;
    }

    const mongoose = require('mongoose');
    about.testimonials.push({ 
      _id: new mongoose.Types.ObjectId(), // Ensure proper ObjectId
      image: finalImageUrl,
      imageKey: finalImageKey,
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
    
    // Accept either a previously-uploaded URL/key from frontend or an actual file via multipart
    const { image, imageKey, rating, name, title, content } = req.body;

    // Handle image update
    if (req.file) {
      // File uploaded - upload to Antryk and replace
      const { v4: uuidv4 } = require('uuid');
      const imageData = req.file;

      // Delete old image from Antryk if present
      if (testimonial.imageKey) {
        try {
          await deleteFromAntryk(testimonial.imageKey);
        } catch (err) {
          console.error('Failed to delete old image from Antryk:', err.message);
        }
      }

      const key = `testimonials/${uuidv4()}_${imageData.originalname || 'image'}`;
      const uploadResult = await uploadToAntryk(imageData, key);
      testimonial.image = uploadResult.url || uploadResult.fileUrl || '';
      testimonial.imageKey = uploadResult.key || uploadResult.objectKey || '';
    } else {
      // No file - backend should accept image and imageKey provided by frontend (already uploaded)
      if (image !== undefined) testimonial.image = image;
      if (imageKey !== undefined) {
        // If imageKey changed and there was a previous imageKey, delete the old object
        if (testimonial.imageKey && testimonial.imageKey !== imageKey) {
          try {
            await deleteFromAntryk(testimonial.imageKey);
          } catch (err) {
            console.error('Failed to delete old image from Antryk:', err.message);
          }
        }
        testimonial.imageKey = imageKey;
      }
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
