// --- backend/routes/questionRoutes.js ---
// Defines API routes for question-related operations, connecting them to controller functions.

const express = require('express');
const router = express.Router(); // Initialize Express router

// Import controller functions for questions
const {
  createQuestion,
  getUnansweredQuestionsForUser,
  submitAnswer,
  getUserScore
} = require('../controllers/questionController');

// --- Define Question Routes ---

// @route   POST /api/questions
// @desc    Create a new question
// @access  "Private" (logic within controller checks user validity)
router.post('/', createQuestion);

// @route   GET /api/questions/for/:userId
// @desc    Get all unanswered questions intended for a specific user
// @access  "Private"
router.get('/for/:userId', getUnansweredQuestionsForUser);

// @route   POST /api/questions/:questionId/answer
// @desc    Submit an answer for a specific question
// @access  "Private"
router.post('/:questionId/answer', submitAnswer);

// @route   GET /api/questions/score/:userId
// @desc    Get the knowledge score for a specific user
// @access  "Private"
router.get('/score/:userId', getUserScore);

module.exports = router; // Export the router to be used in server.js
