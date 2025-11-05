const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const uploadResume = require('../middleware/multerResume');
const {
  createDocuments,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument
} = require('../controllers/documentController');

// Protected routes: both admin and users can view documents
router.get('/', protect, getDocuments);
router.get('/:id', protect, getDocumentById);

// Admin: create, update, delete
router.post('/', protect, adminOnly, uploadResume.array('files', 13), createDocuments);
router.put('/:id', protect, adminOnly, uploadResume.single('file'), updateDocument);
router.delete('/:id', protect, adminOnly, deleteDocument);

module.exports = router;
