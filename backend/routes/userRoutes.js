// --- backend/routes/userRoutes.js ---
// Defines API routes for user-related operations, connecting them to controller functions.

const express = require('express');
const router = express.Router(); // Initialize Express router

// Import controller functions for users
const {
  getAllUsers,
  getUserByUsername,
  getUserById
} = require('../controllers/userController');

// --- Define User Routes ---

// @route   GET /api/users
// @desc    Get all users (e.g., for selection on the frontend)
// @access  Public
router.get('/', getAllUsers);

// @route   GET /api/users/:username
// @desc    Get a specific user by their username
// @access  Public
router.get('/:username', getUserByUsername); // Note: ensure usernames don't conflict with other routes like '/id/:userId'

// @route   GET /api/users/id/:userId
// @desc    Get a specific user by their MongoDB ObjectId
// @access  Public
router.get('/id/:userId', getUserById);


module.exports = router; // Export the router to be used in server.js
