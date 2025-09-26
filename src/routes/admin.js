const express = require('express');
const {
    getAllContacts,
    getContactById,
    updateContactStatus,
    deleteContact,
    getContactStats
} = require('../controllers/contactController');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(protect);
router.use(adminOnly);

// Contact management routes for admin (protected)
router.get('/contacts/stats', getContactStats);
router.get('/contacts', getAllContacts);
router.get('/contacts/:id', getContactById);
router.put('/contacts/:id', updateContactStatus);
router.delete('/contacts/:id', deleteContact);

// Other admin routes will be added here
// Example: router.get('/dashboard', getAdminDashboard);

module.exports = router;