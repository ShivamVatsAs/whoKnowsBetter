// --- backend/config/db.js ---
// Handles MongoDB connection and initial user setup
const mongoose = require('mongoose');
const User = require('../models/User'); // Import the User model

const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the URI from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // useNewUrlParser: true, // No longer needed in Mongoose 6+
      // useUnifiedTopology: true, // No longer needed in Mongoose 6+
      // useCreateIndex: true, // No longer supported, Mongoose 6+ handles this by default
      // useFindAndModify: false, // No longer supported, Mongoose 6+ uses findOneAndUpdate()
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // --- Initialize Users ---
    // This is a good place to ensure your two primary users exist.
    // The findOrCreate static method was defined in the User model.
    await User.findOrCreate('Shivam');
    await User.findOrCreate('Shreya');
    console.log('Ensured Shivam and Shreya users exist.');

  } catch (error) {
    console.error(`Error connecting to MongoDB or initializing users: ${error.message}`);
    // Exit process with failure if DB connection fails, as the app can't run without it.
    process.exit(1);
  }
};

module.exports = connectDB;
