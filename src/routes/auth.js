const express = require('express');
const router = express.Router();
const {
    signin,
    forgotPassword,
    validateToken,
    resetPassword,
    getMe,
    generateTestToken
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

// @route   POST /api/auth/signin
// @desc    Admin sign in
// @access  Public
router.post('/signin', signin);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', forgotPassword);

// @route   GET /api/auth/validate-token/:token
// @desc    Validate password reset token
// @access  Public
router.get('/validate-token/:token', validateToken);

// @route   PUT /api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.put('/reset-password/:token', resetPassword);

// @route   GET /api/auth/me
// @desc    Get current admin user info (access token info)
// @access  Private (Admin only)
router.get('/me', protect, adminOnly, getMe);

// @route   POST /api/auth/generate-test-token
// @desc    Generate reset token for testing (Development only)
// @access  Public
if (process.env.NODE_ENV === 'development') {
    const { generateTestToken } = require('../controllers/authController');
    router.post('/generate-test-token', generateTestToken);
}

module.exports = router;