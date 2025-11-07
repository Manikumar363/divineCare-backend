const Gallery = require('../../models/Home/Gallery');

// GET gallery data
exports.getGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findOne();
    res.status(200).json({ success: true, gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update gallery data
exports.updateGallery = async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (req.file) {
      const { v4: uuidv4 } = require('uuid');
      const { uploadToAntryk } = require('../../utils/cloudinaryHelper');
      const key = `gallery/${uuidv4()}_${req.file.originalname}`;
      const uploadResult = await uploadToAntryk(req.file, key);
      updateData.imageKey = uploadResult.key;
    }
    const gallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!gallery) return res.status(404).json({ success: false, message: 'Gallery not found' });
    res.status(200).json({ success: true, gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
