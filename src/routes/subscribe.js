const express = require('express');
const router = express.Router();
const { subscribe, getAllSubscriptions } = require('../controllers/subscribeController');
const { protect, adminOnly } = require('../middleware/auth');

// Public subscribe endpoint
router.post('/', subscribe);

// Admin fetch all subscriptions
router.get('/', protect, adminOnly, getAllSubscriptions);

module.exports = router;
