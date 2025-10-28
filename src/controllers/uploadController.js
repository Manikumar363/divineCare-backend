const cloudinary = require('../config/cloudinary');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const uploadResults = [];
    for (const file of req.files) {
      let result;
      
      // Handle memory storage (buffer) - our updated multer config
      if (file.buffer) {
        result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          {
            folder: 'divinecare',
            resource_type: 'auto',
          }
        );
      }
      // Handle disk storage (path) - fallback for compatibility
      else if (file.path) {
        result = await cloudinary.uploader.upload(file.path, {
          folder: 'divinecare',
          resource_type: 'auto',
        });
      } else {
        throw new Error('Invalid file format - no buffer or path found');
      }
      
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
    console.error('Upload error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};