// --- backend/models/User.js ---
// Defines the schema for a User
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Using fixed names as there are only two users
  username: {
    type: String,
    required: true,
    enum: ['Shivam', 'Shreya'], // Only allow these two names
    unique: true,
  },
  // You could add other fields later if needed, like profilePictureUrl, etc.
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

// Static method to find or create users.
// This is useful to ensure Shivam and Shreya are always in the database.
userSchema.statics.findOrCreate = async function(username) {
  let user = await this.findOne({ username });
  if (!user) {
    user = await this.create({ username });
    console.log(`Created user: ${username}`);
  }
  return user;
};

module.exports = mongoose.model('User', userSchema);
