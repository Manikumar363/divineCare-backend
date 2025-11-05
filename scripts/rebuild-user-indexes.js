require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/divineCare';

(async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Get the users collection
        const db = mongoose.connection.db;
        const collection = db.collection('users');

        // Drop all existing indexes except _id
        console.log('Dropping all existing indexes...');
        const indexes = await collection.indexes();
        for (const index of indexes) {
            if (index.name !== '_id_') {
                await collection.dropIndex(index.name);
                console.log(`Dropped index: ${index.name}`);
            }
        }

        // Create new indexes
        console.log('Creating new indexes...');
        await collection.createIndex({ email: 1 }, { unique: true });
        await collection.createIndex({ role: 1 });
        await collection.createIndex({ resetPasswordToken: 1 }, { sparse: true });

        console.log('Index cleanup complete. New indexes created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})();