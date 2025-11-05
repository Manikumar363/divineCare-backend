const express = require('express');
const router = express.Router();
const { requestOTP, verifyOTP, resetPasswordWithOTP } = require('../controllers/passwordResetController');
const { changePassword } = require('../controllers/passwordChangeController');
const { protect } = require('../middleware/auth');

// Password reset routes with OTP (public routes)
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password-otp', resetPasswordWithOTP);

// Change password route (protected route - requires login)
router.post('/change', protect, changePassword);

module.exports = router;