const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// Configure nodemailer (you'll need to add email credentials to .env)
let transporter;
try {
    if (process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: true, // use SSL
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
        console.log('📧 Email service configured successfully');
    } else {
        console.log('📧 Email credentials not provided');
    }
} catch (error) {
    console.log('Email configuration error:', error.message);
}

// @desc    Admin Sign In
// @route   POST /api/auth/signin
// @access  Public
exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check for admin user - include password in query
        const user = await User.findOne({ 
            email: email.toLowerCase(),
            role: 'admin',
            isActive: true
        }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Sign in successful',
            data: {
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    lastLogin: user.lastLogin
                }
            }
        });

    } catch (error) {
        console.error('Sign in error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email address'
            });
        }

        const user = await User.findOne({ 
            email: email.toLowerCase(),
            role: 'admin',
            isActive: true
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No admin user found with that email address'
            });
        }

        // Generate reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

        const message = `
            <h2>DivineCare Admin Password Reset</h2>
            <p>You are receiving this email because you (or someone else) has requested the reset of a password for your admin account.</p>
            <p>Please click on the following link to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            <p>This link will expire in 10 minutes.</p>
        `;

        try {
            if (!transporter) {
                return res.status(500).json({
                    success: false,
                    message: 'Email service not configured. Please contact administrator.'
                });
            }

            await transporter.sendMail({
                from: `DivineCare Admin <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
                to: user.email,
                subject: 'Password Reset Request',
                html: message,
            });

            res.status(200).json({
                success: true,
                message: 'Password reset email sent successfully'
            });

        } catch (error) {
            console.error('Email error:', error);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: 'Email could not be sent. Please try again later.'
            });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Validate Reset Token
// @route   GET /api/auth/validate-token/:token
// @access  Public
exports.validateToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Reset token is required'
            });
        }

        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
            role: 'admin',
            isActive: true
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Reset token is valid',
            data: {
                email: user.email
            }
        });

    } catch (error) {
        console.error('Validate token error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Reset token is required'
            });
        }

        if (!password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide password and confirm password'
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

        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
            role: 'admin',
            isActive: true
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        // Generate token
        const jwtToken = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Password reset successful',
            data: {
                token: jwtToken,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Get Access Token Info
// @route   GET /api/auth/me
// @access  Private (Admin)
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User details retrieved successfully',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt
                }
            }
        });

    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Generate Test Reset Token (Development Only)
// @route   POST /api/auth/generate-test-token
// @access  Public (Development only)
exports.generateTestToken = async (req, res) => {
    try {
        if (process.env.NODE_ENV !== 'development') {
            return res.status(403).json({
                success: false,
                message: 'This endpoint is only available in development mode'
            });
        }

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email address'
            });
        }

        const user = await User.findOne({ 
            email: email.toLowerCase(),
            role: 'admin',
            isActive: true
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No admin user found with that email address'
            });
        }

        // Generate reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: 'Test reset token generated successfully',
            data: {
                resetToken,
                email: user.email,
                expiresIn: '10 minutes',
                validateUrl: `${req.protocol}://${req.get('host')}/api/auth/validate-token/${resetToken}`,
                resetUrl: `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`
            }
        });

    } catch (error) {
        console.error('Generate test token error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    User / Portal Login (admin or regular users)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        // Find any active user by email (admin or user)
        const user = await User.findOne({ email: email.toLowerCase(), isActive: true }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    lastLogin: user.lastLogin
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};