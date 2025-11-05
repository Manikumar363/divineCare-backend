const User = require('../models/User');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailService');

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Request OTP for password reset
// @route   POST /api/auth/request-otp
// @access  Public
exports.requestOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email address'
            });
        }

        // Find user
        const user = await User.findOne({ 
            email: email.toLowerCase(),
            isActive: true
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with that email address'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        
        // Hash OTP before saving
        const hashedOTP = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');

        // Set OTP and expiry (10 minutes)
        user.otpToken = hashedOTP;
        user.otpExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

        // Prepare email
        const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>DivineCare Password Reset</h2>
                <p>You have requested to reset your password.</p>
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
                    <h3 style="margin: 0;">Your OTP:</h3>
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 10px 0;">
                        ${otp}
                    </div>
                </div>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
            </div>
        `;

        await sendEmail({
            to: user.email,
            subject: 'Password Reset OTP',
            html: message
        });

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email'
        });

    } catch (error) {
        console.error('Request OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP'
        });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and OTP'
            });
        }

        // Hash provided OTP
        const hashedOTP = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');

        // Find user with matching OTP and valid expiry
        const user = await User.findOne({
            email: email.toLowerCase(),
            otpToken: hashedOTP,
            otpExpire: { $gt: Date.now() },
            isActive: true
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Generate a temporary token for password reset
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        // Store hashed version
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
            
        user.resetPasswordExpire = Date.now() + 5 * 60 * 1000; // 5 minutes to reset
        user.otpToken = undefined;
        user.otpExpire = undefined;
        
        await user.save();

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            data: {
                resetToken
            }
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'OTP verification failed'
        });
    }
};

// @desc    Reset Password with verified OTP token
// @route   POST /api/auth/reset-password-otp
// @access  Public
exports.resetPasswordWithOTP = async (req, res) => {
    try {
        const { resetToken, password, confirmPassword } = req.body;

        if (!resetToken || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Find user with valid reset token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
            isActive: true
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password and clear reset tokens
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password'
        });
    }
};