const TestimonialSection = require('../../models/Home/TestimonialSection');

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
    section.testimonials.push({ rating, content, name, designation, image });
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
    Object.assign(testimonial, req.body);
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
    section.testimonials.splice(index, 1);
    await section.save();
    res.status(200).json({ success: true, section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
