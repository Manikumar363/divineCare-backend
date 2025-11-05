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

        // List all indexes
        console.log('Current indexes:');
        const indexes = await collection.indexes();
        console.log(indexes);

        // Drop any problematic indexes
        try {
            await collection.dropIndex('username_1');
            console.log('Dropped username index');
        } catch (e) {
            console.log('No username index found (this is okay)');
        }

        // Ensure correct indexes exist
        await collection.createIndex({ email: 1 }, { unique: true });
        await collection.createIndex({ role: 1 });
        console.log('Created required indexes');

        console.log('Index cleanup complete');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})();