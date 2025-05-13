// --- backend/config/db.js ---
// Handles MongoDB connection and initial user setup
const mongoose = require('mongoose');
const User = require('../models/User'); // Import the User model

const connectDB = async () => {
  console.log('[DB] Attempting to connect to MongoDB...');
  if (process.env.MONGO_URI) {
    console.log('[DB] MONGO_URI is set.');
    // Avoid logging sensitive parts of the URI directly in production logs often
    // For temporary debugging, you could log a non-sensitive part:
    // const uriParts = process.env.MONGO_URI.split('@');
    // if (uriParts.length > 1) console.log('[DB] MONGO_URI cluster part (approx):', uriParts[1].split('/')[0]);
  } else {
    console.error('[DB] CRITICAL: MONGO_URI environment variable is NOT SET.');
    throw new Error('MONGO_URI environment variable is not set.');
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 6+ uses sensible defaults for these:
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increased timeout for server selection
      connectTimeoutMS: 10000         // Mongoose 5+; may or may not apply to Mongoose 8 directly but doesn't hurt
    });

    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);

    // --- Initialize Users ---
    console.log('[DB] Attempting to findOrCreate Shivam...');
    await User.findOrCreate('Shivam');
    console.log('[DB] Shivam user process complete.');
    console.log('[DB] Attempting to findOrCreate Shreya...');
    await User.findOrCreate('Shreya');
    console.log('[DB] Shreya user process complete.');
    console.log('[DB] Ensured Shivam and Shreya users exist.');

  } catch (error) {
    console.error(`[DB] Error in connectDB function: ${error.message}`);
    console.error('[DB] Full error object during DB connection/setup:', error);
    console.error('[DB] DB connection/setup error stack:', error.stack);
    // Re-throw the error to ensure it's caught by a higher-level handler or Vercel
    // This will cause the serverless function to fail if the DB doesn't connect,
    // which is desired behavior to signal a critical failure.
    throw error;
  }
};

module.exports = connectDB;
