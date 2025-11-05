const mongoose = require('mongoose');
require('dotenv').config();

// Use the same MONGODB_URI as your main application
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error('Error: MONGODB_URI is not set in environment variables');
    process.exit(1);
}

console.log('Using MongoDB URI:', MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//<username>:<password>@'));

(async () => {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected successfully');

        // Get the collection
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Get current indexes
        const indexes = await usersCollection.indexes();
        console.log('\nCurrent indexes:', indexes);

        // Drop the problematic username index
        console.log('\nAttempting to drop username index...');
        try {
            await usersCollection.dropIndex('username_1');
            console.log('Successfully dropped username_1 index');
        } catch (error) {
            console.log('Error dropping index:', error.message);
        }

        // Verify indexes after dropping
        const remainingIndexes = await usersCollection.indexes();
        console.log('\nRemaining indexes:', remainingIndexes);

        // Create correct indexes
        console.log('\nEnsuring correct indexes...');
        await usersCollection.createIndex({ email: 1 }, { unique: true });
        
        console.log('\nDone! You can now restart your server and try the request again.');
        process.exit(0);
    } catch (error) {
        console.error('Script error:', error);
        process.exit(1);
    }
})();