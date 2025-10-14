const AboutTestimonials = require('../../models/about/aboutTestimonials');

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
    about.testimonials.push({ image, rating, name, title, content });
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
    Object.assign(testimonial, req.body);
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
    about.testimonials.splice(index, 1);
    await about.save();
    res.status(200).json({ success: true, about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
