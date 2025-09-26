require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const createAdminUser = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🗄️ MongoDB Connected');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        
        if (existingAdmin) {
            console.log('❌ Admin user already exists!');
            console.log('Email:', existingAdmin.email);
            process.exit(0);
        }

        // Create admin user
        const adminUser = await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@divinecare.com',
            password: 'admin123', // Change this password after first login
            role: 'admin',
            isActive: true
        });

        console.log('✅ Admin user created successfully!');
        console.log('📧 Email: admin@divinecare.com');
        console.log('🔑 Password: admin123');
        console.log('⚠️  Please change this password after first login!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        process.exit(1);
    }
};

createAdminUser();