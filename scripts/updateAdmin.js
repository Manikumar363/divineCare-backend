require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const updateAdminUser = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🗄️ MongoDB Connected');

        // Update the existing admin user
        const updatedAdmin = await User.findOneAndUpdate(
            { role: 'admin' },
            {
                firstName: 'Sandy',
                lastName: 'Admin',
                email: 'samdyboy061@gmail.com',
                password: 'sandy061', // This will be hashed by the pre-save middleware
                isActive: true
            },
            { new: true }
        );

        if (updatedAdmin) {
            console.log('✅ Admin user updated successfully!');
            console.log('📧 Email: samdyboy061@gmail.com');
            console.log('🔑 Password: sandy061');
            console.log('👤 Name: Sandy Admin');
        } else {
            console.log('❌ No admin user found to update');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating admin user:', error.message);
        process.exit(1);
    }
};

updateAdminUser();