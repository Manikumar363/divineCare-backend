const cloudinary = require('../config/cloudinary');

/**
 * Upload image to Cloudinary
 * @param {string|object} imageData - Either base64 string or file object from multer
 * @param {string} folder - Cloudinary folder name
 * @param {string} oldPublicId - Optional: public_id of old image to delete
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
const uploadToCloudinary = async (imageData, folder = 'divinecare', oldPublicId = null) => {
  try {
    // Delete old image if public_id is provided
    if (oldPublicId) {
      await cloudinary.uploader.destroy(oldPublicId);
    }

    let uploadResult;

    // Handle file upload from multer (memory storage - has buffer)
    if (imageData && imageData.buffer) {
      uploadResult = await cloudinary.uploader.upload(
        `data:${imageData.mimetype};base64,${imageData.buffer.toString('base64')}`,
        {
          folder: folder,
          resource_type: 'auto'
        }
      );
    }
    // Handle file upload from multer (disk storage - has path)
    else if (imageData && imageData.path) {
      uploadResult = await cloudinary.uploader.upload(imageData.path, {
        folder: folder,
        resource_type: 'auto'
      });
    }
    // Handle base64 string
    else if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
      uploadResult = await cloudinary.uploader.upload(imageData, {
        folder: folder,
        resource_type: 'auto'
      });
    }
    // Handle direct URL (already uploaded)
    else if (typeof imageData === 'string' && imageData.startsWith('http')) {
      return {
        secure_url: imageData,
        public_id: null // We don't have public_id for external URLs
      };
    }
    else {
      throw new Error('Invalid image data format');
    }

    return {
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
};