const axios = require('axios');
const FormData = require('form-data');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const Service = require('../models/Service'); // Example model, adjust as needed

const ANTRYK_ACCESS_KEY = process.env.ANTRYK_ACCESS_KEY;
const ANTRYK_SECRET_KEY = process.env.ANTRYK_SECRET_KEY;
const ANTRYK_BUCKET_NAME = process.env.ANTRYK_BUCKET_NAME;
const ANTRYK_BASE_URL = process.env.ANTRYK_BASE_URL;

exports.uploadFile = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const uploadResults = [];
    for (const file of req.files) {
      // Find DB record if needed (example: Service)
      let dbRecord = null;
      if (req.body.serviceId) {
        dbRecord = await Service.findById(req.body.serviceId);
      }
      // Use existing imageKey if present, else generate new UUID key
      let key;
      if (dbRecord && dbRecord.imageKey) {
        key = dbRecord.imageKey;
      } else {
        key = `uploads/${uuidv4()}_${file.originalname}`;
      }

      // Prepare form-data for Antryk
      const formData = new FormData();
      formData.append('bucket', ANTRYK_BUCKET_NAME);
      formData.append('key', key);
      formData.append('accessKey', ANTRYK_ACCESS_KEY);
      formData.append('secretKey', ANTRYK_SECRET_KEY);
      formData.append('file', file.buffer, file.originalname);

      // Upload to Antryk
      const response = await axios.post('https://storage.apis.antryk.com/api/v1/objects', formData, {
        headers: formData.getHeaders()
      });

      if (response.data && response.data.success) {
        // Update DB record if present
        if (dbRecord) {
          dbRecord.imageKey = key;
          dbRecord.bucket = ANTRYK_BUCKET_NAME;
          dbRecord.url = `${ANTRYK_BASE_URL}/${key}`;
          await dbRecord.save();
        }
        uploadResults.push({
          key, // e.g., uploads/uuid_filename.jpg
          url: key // just the path, not the full URL
        });
      } else {
        throw new Error('Antryk upload failed: ' + JSON.stringify(response.data));
      }
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

// Public endpoint: upload a single file (used by users). Does not require auth.
exports.uploadPublicFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const file = req.file;
    const folder = req.body.folder || 'uploads';

    // Generate a key
    const key = `${folder}/${uuidv4()}_${file.originalname}`;

    // Prepare form-data for Antryk
    const formData = new FormData();
    formData.append('bucket', ANTRYK_BUCKET_NAME);
    formData.append('key', key);
    formData.append('accessKey', ANTRYK_ACCESS_KEY);
    formData.append('secretKey', ANTRYK_SECRET_KEY);
    formData.append('file', file.buffer, file.originalname);

    const response = await axios.post('https://storage.apis.antryk.com/api/v1/objects', formData, {
      headers: formData.getHeaders()
    });

    if (response.data && response.data.success) {
      const returnedKey = response.data.key || key;
      const publicUrl = `${ANTRYK_BASE_URL.replace(/\/$/, '')}/${String(returnedKey).replace(/^\/+/, '')}`;
      return res.status(200).json({
        success: true,
        files: [{ key: returnedKey, url: publicUrl }]
      });
    }

    throw new Error('Antryk upload failed: ' + JSON.stringify(response.data));
  } catch (error) {
    console.error('Public upload error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};