require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const recreateAdminUser = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🗄️ MongoDB Connected');

        // Delete existing admin user
        await User.deleteMany({ role: 'admin' });
        console.log('🗑️ Deleted existing admin users');

        // Create new admin user (password will be hashed by pre-save middleware)
        const adminUser = await User.create({
            firstName: 'Sandy',
            lastName: 'Admin', 
            email: 'samdyboy061@gmail.com',
            password: 'sandy061',
            role: 'admin',
            isActive: true
        });

        console.log('✅ New admin user created successfully!');
        console.log('📧 Email: samdyboy061@gmail.com');
        console.log('🔑 Password: sandy061');
        console.log('👤 Name: Sandy Admin');
        console.log('🆔 ID:', adminUser._id);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        process.exit(1);
    }
};

recreateAdminUser();