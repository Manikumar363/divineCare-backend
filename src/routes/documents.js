const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const uploadResume = require('../middleware/multerResume');
const {
  createDocuments,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  uploadSingleDocument
} = require('../controllers/documentController');

// Protected routes: both admin and users can view documents
router.get('/', protect, getDocuments);
router.get('/:id', protect, getDocumentById);


// Admin: create multiple documents
router.post('/', protect, adminOnly, uploadResume.array('files', 13), createDocuments);

// Admin: upload single document
router.post('/single', protect, adminOnly, uploadResume.single('file'), uploadSingleDocument);

// Allow JSON updates without requiring multipart file upload. File replacement is still supported
// via the separate /single upload endpoint or by sending multipart to a dedicated endpoint.
router.put('/:id', protect, adminOnly, updateDocument);
router.delete('/:id', protect, adminOnly, deleteDocument);

module.exports = router;
