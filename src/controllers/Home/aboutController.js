const About = require('../../models/Home/About');

// GET about section data
exports.getAbout = async (req, res) => {
  try {
    const about = await About.findOne();
    res.status(200).json({ success: true, about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update about section
exports.updateAbout = async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (req.file) {
      const { v4: uuidv4 } = require('uuid');
      const { uploadToAntryk } = require('../../utils/cloudinaryHelper');
      const key = `home-about/${uuidv4()}_${req.file.originalname}`;
      const uploadResult = await uploadToAntryk(req.file, key);
      updateData.imageKey = uploadResult.key;
    }
    const about = await About.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!about) return res.status(404).json({ success: false, message: 'About section not found' });
    res.status(200).json({ success: true, about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

