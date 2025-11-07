
const Document = require('../models/Document');
const { uploadToAntryk, deleteFromAntryk } = require('../utils/cloudinaryHelper');

// Upload a single document (admin)
exports.uploadSingleDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }
    const title = req.body.title || req.file.originalname.replace(/\.[^/.]+$/, "");
    const category = req.body.category || title;
    const description = req.body.description || '';

    // Upload to Antryk
    const { v4: uuidv4 } = require('uuid');
    const key = `documents/${uuidv4()}_${req.file.originalname}`;
    const uploadResult = await uploadToAntryk(req.file, key);
    const doc = await Document.create({
      title,
      category,
      description,
      fileKey: uploadResult.key,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user ? req.user._id : undefined
    });

    res.status(201).json({ success: true, document: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create multiple documents (admin) - supports multiple file uploads
exports.createDocuments = async (req, res) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ success: false, message: 'Files are required' });
    }

    let categories;
    try {
      categories = req.body.categories ? JSON.parse(req.body.categories) : [];
    } catch (e) {
      categories = [];
    }

    // Process each file upload concurrently
    const uploadPromises = req.files.map(async (file, index) => {
      try {
        // Get category or fallback to filename without extension
        const { v4: uuidv4 } = require('uuid');
        const fileName = file.originalname.replace(/\.[^/.]+$/, "");
        const category = categories[index] || fileName;
        const title = categories[index] || fileName;

        // Upload to Antryk
        const key = `documents/${uuidv4()}_${file.originalname}`;
        const uploadResult = await uploadToAntryk(file, key);
        // Create document entry
        const doc = await Document.create({
          title,
          category,
          description: req.body.description,
          fileKey: uploadResult.key,
          mimeType: file.mimetype,
          size: file.size,
          uploadedBy: req.user ? req.user._id : undefined
        });

        return { success: true, document: doc };
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        return { success: false, error: error.message, fileName: file.originalname };
      }
    });

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);

    // Separate successful and failed uploads
    const successful = results.filter(r => r.success).map(r => r.document);
    const failed = results.filter(r => !r.success);

    const response = {
      success: true,
      message: successful.length > 0 ? "Documents uploaded successfully" : "No documents were uploaded successfully",
      documents: successful
    };

    if (failed.length > 0) {
      response.failedUploads = failed;
    }

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get list of documents (public) with optional filters
exports.getDocuments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { category, search } = req.query;

    let query = {};
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const docs = await Document.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Document.countDocuments(query);

    res.status(200).json({ success: true, documents: docs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single document by id (public)
exports.getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.status(200).json({ success: true, document: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update document (admin) - can replace file
exports.updateDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    const { title, category, description, fileUrl } = req.body;

    // Handle file replacement
    if (req.file) {
      // Delete old file from Antryk if present
      if (doc.fileKey) {
        const { deleteFromAntryk } = require('../utils/cloudinaryHelper');
        try {
          await deleteFromAntryk(doc.fileKey);
        } catch (err) {
          console.error('Failed to delete old file from Antryk:', err.message);
        }
      }
      const { v4: uuidv4 } = require('uuid');
      const key = `documents/${uuidv4()}_${req.file.originalname}`;
      const uploadResult = await uploadToAntryk(req.file, key);
      doc.fileKey = uploadResult.key;
      doc.mimeType = req.file.mimetype;
      doc.size = req.file.size;
    }

    if (title !== undefined) doc.title = title;
    if (category !== undefined) doc.category = category;
    if (description !== undefined) doc.description = description;

    await doc.save();
    res.status(200).json({ success: true, document: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete document (admin)
exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    if (doc.fileKey) {
      const { deleteFromAntryk } = require('../utils/cloudinaryHelper');
      try {
        await deleteFromAntryk(doc.fileKey);
      } catch (err) {
        console.error('Failed to delete file from Antryk:', err.message);
      }
    }

    await Document.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
