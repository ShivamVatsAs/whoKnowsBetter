// --- backend/controllers/userController.js ---
// THIS FILE IS ALREADY SUITABLE FOR BOTH LOCAL AND PRODUCTION

const User = require('../models/User');
const mongoose = require('mongoose');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('username _id');
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Server error while fetching users.' });
  }
};

exports.getUserByUsername = async (req, res) => {
  try {
    const username = req.params.username;
    if (!['Shivam', 'Shreya'].includes(username)) {
        return res.status(400).json({ message: 'Invalid username provided.' });
    }
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ message: `User '${username}' not found.` });
    }
    res.json(user);
  } catch (error) {
    console.error(`Error fetching user ${req.params.username}:`, error);
    res.status(500).json({ message: 'Server error while fetching user details.' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format.' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: `User with ID '${userId}' not found.` });
    }
    res.json(user);
  } catch (error) {
    console.error(`Error fetching user by ID ${req.params.userId}:`, error);
    res.status(500).json({ message: 'Server error while fetching user details.' });
  }
};