const cloudinary = require('../config/cloudinary');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const uploadResults = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'divinecare',
        resource_type: 'auto',
      });
      uploadResults.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }
    return res.status(200).json({
      success: true,
      files: uploadResults,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};