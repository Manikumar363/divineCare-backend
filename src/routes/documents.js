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
  uploadSingleDocument,
  deleteDocumentByKey
} = require('../controllers/documentController');

// Protected routes: both admin and users can view documents
router.get('/', protect, getDocuments);
router.get('/:id', protect, getDocumentById);


// Admin: create multiple documents
router.post('/', protect, adminOnly, uploadResume.array('files', 13), createDocuments);

// Admin: upload single document
router.post('/single', protect, adminOnly, uploadResume.single('file'), uploadSingleDocument);

// Admin: delete document(s) by id, fileKey or fileUrl
router.post('/delete-by-key', protect, adminOnly, deleteDocumentByKey);

// Allow both JSON updates and multipart file replacement on the same route.
// Multer will only process the request when Content-Type is multipart/form-data, otherwise
// the request will flow as a normal JSON update.
router.put('/:id', protect, adminOnly, uploadResume.single('file'), updateDocument);
router.delete('/:id', protect, adminOnly, deleteDocument);

module.exports = router;
