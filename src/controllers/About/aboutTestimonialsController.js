const AboutTestimonials = require('../../models/About/aboutTestimonials');
const { uploadToCloudinary, deleteFromCloudinary } = require('../../utils/cloudinaryHelper');

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
    const about = await AboutTestimonials.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!about) return res.status(404).json({ success: false, message: 'About Testimonials section not found' });
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
    
    // Handle image upload to Cloudinary
    let imageUrl = '';
    let imagePublicId = '';
    
    if (image || req.file) {
      const imageData = req.file || image;
      const uploadResult = await uploadToCloudinary(imageData, 'divinecare/testimonials');
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }
    
    about.testimonials.push({ 
      image: imageUrl, 
      imagePublicId, 
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
      const imageData = req.file || image;
      const oldPublicId = testimonial.imagePublicId;
      const uploadResult = await uploadToCloudinary(imageData, 'divinecare/testimonials', oldPublicId);
      testimonial.image = uploadResult.secure_url;
      testimonial.imagePublicId = uploadResult.public_id;
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
    
    // Delete image from Cloudinary before removing testimonial
    const testimonial = about.testimonials[index];
    if (testimonial.imagePublicId) {
      await deleteFromCloudinary(testimonial.imagePublicId);
    }
    
    about.testimonials.splice(index, 1);
    await about.save();
    res.status(200).json({ success: true, about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
