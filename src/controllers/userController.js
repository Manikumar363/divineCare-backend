const User = require('../models/User');
const { sendWelcomeEmail } = require('../utils/emailService');
const crypto = require('crypto');

/**
 * Creates a new user and sends welcome email with credentials
 * @route POST /api/users/create
 * @access Admin only
 */
exports.createUser = async (req, res) => {
    try {
        const { name, email } = req.body;

        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both name and email'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(200).json({
                success: true,
                message: 'User already exists',
                user: {
                    id: existingUser._id,
                    name: existingUser.firstName,
                    email: existingUser.email
                }
            });
        }

        // Generate random password
        const password = crypto.randomBytes(8).toString('hex');

        // Create user data object
        const userData = {
            firstName: name.trim(),  // Store full name in firstName
            lastName: '',           // Keep lastName empty
            email,
            password,
            role: 'user',
            isActive: true
        };

        // Create new user
        const user = await User.create(userData);

        try {
            // Send welcome email with credentials
            await sendWelcomeEmail(user, password);
        } catch (error) {
            console.error('Email sending failed:', error.message);
            // Continue anyway - we'll return the password in development mode
        }

        // Prepare response
        const response = {
            success: true,
            message: process.env.NODE_ENV === 'development' 
                ? 'User created successfully' 
                : 'User created successfully and credentials emailed',
            user: {
                id: user._id,
                name: user.firstName,
                email: user.email
            }
        };

        // Include credentials in development mode
        if (process.env.NODE_ENV === 'development') {
            response.credentials = {
                email: user.email,
                password: password,
                loginUrl: 'https://divinecaredocument.vercel.app/login'
            };
        }

        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
};