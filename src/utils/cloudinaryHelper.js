const axios = require('axios');
require('dotenv').config();
const FormData = require('form-data'); // Add this at the top


const ANTRYK_ACCESS_KEY = process.env.ANTRYK_ACCESS_KEY;
const ANTRYK_SECRET_KEY = process.env.ANTRYK_SECRET_KEY;
const ANTRYK_BUCKET_NAME = process.env.ANTRYK_BUCKET_NAME;
const ANTRYK_BASE_URL = process.env.ANTRYK_BASE_URL;


/**

/**
 * Upload file to Antryk Storage
 * @param {object} fileData - Multer file object (memory or disk)
 * @param {string} key - Path/key for storage (e.g., 'uploads/filename.jpg')
 * @returns {Promise<{url: string, key: string, bucket: string}>}
 */
const uploadToAntryk = async (fileData, key) => {
  try {
    if (!fileData) throw new Error('No file data provided');
    const formData = new FormData(); // Use this instead of new FormData()
    formData.append('bucket', ANTRYK_BUCKET_NAME);
    formData.append('key', key);
    formData.append('accessKey', ANTRYK_ACCESS_KEY);
    formData.append('secretKey', ANTRYK_SECRET_KEY);

    if (fileData.buffer) {
      formData.append('file', fileData.buffer, fileData.originalname);
    } else if (fileData.path) {
      const fs = require('fs');
      formData.append('file', fs.createReadStream(fileData.path));
    } else {
      throw new Error('Unsupported file format for upload');
    }

    const response = await axios.post('https://storage.apis.antryk.com/api/v1/objects', formData, {
      headers: formData.getHeaders()
    });
    if (response.data && response.data.success) {
      return {
        url: `${ANTRYK_BASE_URL}/${key}`,
        key: response.data.key,
        bucket: response.data.bucket
      };
    } else {
      throw new Error('Antryk upload failed: ' + JSON.stringify(response.data));
    }
  } catch (error) {
    console.error('Antryk upload error:', error);
    throw new Error('Failed to upload file to Antryk: ' + (error && error.message ? error.message : 'unknown error'));
  }
};


// Antryk API does not support object deletion in the provided docs. Stub for future use.
const deleteFromAntryk = async (key) => {
  try {
    const response = await axios.delete('https://storage.apis.antryk.com/api/v1/objects', {
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        bucket: ANTRYK_BUCKET_NAME,
        key,
        accessKey: ANTRYK_ACCESS_KEY,
        secretKey: ANTRYK_SECRET_KEY
      }
    });
    if (response.data && response.data.success) {
      return {
        success: true,
        key: response.data.key,
        bucket: response.data.bucket
      };
    } else {
      throw new Error('Antryk delete failed: ' + JSON.stringify(response.data));
    }
  } catch (error) {
    console.error('Antryk delete error:', error);
    throw new Error('Failed to delete file from Antryk: ' + (error && error.message ? error.message : 'unknown error'));
  }
};

module.exports = {
  uploadToAntryk,
  deleteFromAntryk
};