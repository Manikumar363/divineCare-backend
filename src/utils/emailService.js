const nodemailer = require('nodemailer');

let transporter;

// Only set up email if credentials are provided
if (process.env.EMAIL_USER && (process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD)) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD // Try APP_PASSWORD first, fall back to EMAIL_PASSWORD
        }
    });

    // Verify connection configuration
    transporter.verify(function (error, success) {
        if (error) {
            console.log('❌ Email configuration error:', error.message);
            if (error.message.includes('Invalid login')) {
                console.log('\n📧 Gmail Setup Guide:');
                console.log('1. Enable 2-Step Verification: https://myaccount.google.com/security');
                console.log('2. Generate App Password: https://myaccount.google.com/apppasswords');
                console.log('3. Update EMAIL_APP_PASSWORD in .env with the 16-digit password\n');
            }
        } else {
            console.log('✉️  Email service ready to send messages');
        }
    });
}

/**
 * Generic email sending function
 * @param {Object} options - Email options (to, subject, html)
 * @returns {Promise} - Resolves when email is sent
 */
exports.sendEmail = async (options) => {
    if (process.env.NODE_ENV === 'development') {
        console.log('\n📧 Development Mode - Email would have been sent:');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Content:', options.html.replace(/<[^>]*>/g, ''));
        return;
    }

    if (!transporter) {
        console.log('Email service not configured - skipping email send');
        return;
    }

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'DivineCare <noreply@divinecare.com>',
        to: options.to,
        subject: options.subject,
        html: options.html
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

/**
 * Sends a welcome email to a new user with their login credentials
 * @param {Object} user - User object containing name and email
 * @param {string} password - Generated password for the user
 * @returns {Promise} - Resolves when email is sent
 */
exports.sendWelcomeEmail = async (user, password) => {
    const options = {
        to: user.email,
        subject: 'Welcome to DivineCare Document Portal',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to DivineCare!</h2>
                <p>Dear ${user.firstName},</p>
                
                <p>Your account has been created successfully. You can now access the DivineCare Document Portal using the following credentials:</p>
                
                <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
                    <p><strong>Login Portal:</strong> <a href="https://divinecaredocument.vercel.app/login">https://divinecaredocument.vercel.app/login</a></p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Password:</strong> ${password}</p>
                </div>
                
                <p>For security reasons, we recommend changing your password after your first login.</p>
                
                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                
                <p>Best regards,<br>The DivineCare Team</p>
            </div>
        `
    };

    await exports.sendEmail(options);
};