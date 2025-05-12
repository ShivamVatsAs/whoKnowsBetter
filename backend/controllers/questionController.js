// --- backend/controllers/questionController.js ---
// Handles logic for question-related API endpoints

const Question = require('../models/Question'); // Import the Question model
const User = require('../models/User');       // Import the User model
const mongoose = require('mongoose');         // Import mongoose for ObjectId validation

// @desc    Create a new question
// @route   POST /api/questions
// @access  "Private" (relies on frontend sending correct user IDs)
exports.createQuestion = async (req, res) => {
  try {
    const { questionText, options, createdByUserId, intendedForUserId } = req.body;

    // --- Basic Input Validation ---
    if (!questionText || !options || !createdByUserId || !intendedForUserId) {
      return res.status(400).json({ message: 'Missing required fields: questionText, options, createdByUserId, or intendedForUserId.' });
    }

    // Validate User IDs
    if (!mongoose.Types.ObjectId.isValid(createdByUserId) || !mongoose.Types.ObjectId.isValid(intendedForUserId)) {
        return res.status(400).json({ message: 'Invalid createdByUserId or intendedForUserId format.' });
    }

    // Ensure creator and recipient are not the same
    if (createdByUserId === intendedForUserId) {
        return res.status(400).json({ message: 'Creator and intended recipient cannot be the same user.' });
    }

    // Validate options structure (e.g., array, text, isCorrect)
    if (!Array.isArray(options) || options.length < 2 || options.length > 4) {
        return res.status(400).json({ message: 'Options must be an array with 2 to 4 items.' });
    }
    if (options.some(opt => typeof opt.text !== 'string' || opt.text.trim() === '' || typeof opt.isCorrect !== 'boolean')) {
        return res.status(400).json({ message: 'Each option must have a non-empty text string and an isCorrect boolean.' });
    }
    if (options.filter(opt => opt.isCorrect).length !== 1) {
        return res.status(400).json({ message: 'Exactly one option must be marked as correct.' });
    }


    // --- Check if users exist ---
    const creator = await User.findById(createdByUserId);
    const recipient = await User.findById(intendedForUserId);

    if (!creator || !recipient) {
        return res.status(404).json({ message: 'Creator or intended recipient user not found.' });
    }

    // --- Create and save the new question ---
    const newQuestion = new Question({
      questionText,
      options, // Frontend should ensure one option has isCorrect: true
      createdBy: createdByUserId,
      intendedFor: intendedForUserId,
    });

    const savedQuestion = await newQuestion.save(); // This will trigger Mongoose schema validations

    // Populate creator and recipient info for the response (optional, but nice for frontend)
    const populatedQuestion = await Question.findById(savedQuestion._id)
        .populate('createdBy', 'username')
        .populate('intendedFor', 'username');

    res.status(201).json(populatedQuestion);

  } catch (error) {
    console.error('Error creating question:', error);
    if (error.name === 'ValidationError') {
      // Mongoose validation errors (e.g., from questionSchema)
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error while creating question.' });
  }
};

// @desc    Get unanswered questions intended for a specific user
// @route   GET /api/questions/for/:userId
// @access  "Private" (relies on frontend sending correct user ID)
exports.getUnansweredQuestionsForUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format.' });
    }

    // Find questions where 'intendedFor' matches the userId and 'answeredCorrectly' is null (unanswered)
    const questions = await Question.find({
      intendedFor: userId,
      answeredCorrectly: null, // Key filter for unanswered questions
    })
    .populate('createdBy', 'username') // Populate the username of the question creator
    .sort({ createdAt: -1 }); // Show newest questions first (optional)

    res.json(questions);

  } catch (error) {
    console.error(`Error fetching unanswered questions for user ${req.params.userId}:`, error);
    res.status(500).json({ message: 'Server error while fetching questions.' });
  }
};

// @desc    Submit an answer for a question
// @route   POST /api/questions/:questionId/answer
// @access  "Private" (relies on frontend sending correct user ID)
exports.submitAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { userId, submittedAnswerText } = req.body; // userId is the person answering

    // --- Validate inputs ---
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
        return res.status(400).json({ message: 'Invalid question ID format.' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format.' });
    }
    if (typeof submittedAnswerText !== 'string' || submittedAnswerText.trim() === '') {
        return res.status(400).json({ message: 'Submitted answer text cannot be empty.' });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    // --- Authorization and State Checks ---
    if (question.intendedFor.toString() !== userId) {
      return res.status(403).json({ message: 'User not authorized to answer this question.' });
    }
    if (question.answeredCorrectly !== null) {
        return res.status(400).json({ message: 'This question has already been answered.' });
    }

    // --- Determine correctness ---
    const correctAnswerObject = question.options.find(opt => opt.isCorrect === true);
    if (!correctAnswerObject) {
        // This should ideally not happen if question creation validation is robust
        console.error(`CRITICAL: Question ${questionId} is missing a correct answer definition.`);
        return res.status(500).json({ message: 'Internal server error: Question data is corrupted.' });
    }

    const isCorrect = (correctAnswerObject.text === submittedAnswerText);

    // --- Update question state ---
    question.submittedAnswer = submittedAnswerText;
    question.answeredCorrectly = isCorrect;

    await question.save();

    res.json({
        message: 'Answer submitted successfully.',
        isCorrect: isCorrect,
        correctAnswerText: correctAnswerObject.text // Send back the correct answer text for feedback
    });

  } catch (error) {
    console.error(`Error submitting answer for question ${req.params.questionId}:`, error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error while submitting answer.' });
  }
};

// @desc    Get knowledge score for a user
// @route   GET /api/questions/score/:userId
// @access  "Private" (relies on frontend sending correct user ID)
exports.getUserScore = async (req, res) => {
    try {
        const userId = req.params.userId; // The user whose score we want to calculate

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }

        // Identify the current user and their partner
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ message: 'Current user not found.' });
        }

        // Find the other user (partner). Since there are only two, this is straightforward.
        const partner = await User.findOne({ _id: { $ne: userId } });
        if (!partner) {
            // This should not happen in a two-user system if both are created.
            return res.status(404).json({ message: 'Partner user not found. Cannot calculate score.' });
        }

        // The score reflects how well the `currentUser` knows their `partner`.
        // So, we need questions:
        // 1. Created BY the `partner` (`createdBy: partner._id`)
        // 2. Intended FOR the `currentUser` (`intendedFor: userId`)
        // 3. That HAVE BEEN ANSWERED (`answeredCorrectly: { $ne: null }`)
        const relevantQuestions = await Question.find({
            createdBy: partner._id,
            intendedFor: userId,
            answeredCorrectly: { $ne: null } // Only consider answered questions
        });

        const totalAnsweredByCurrentUserAboutPartner = relevantQuestions.length;

        if (totalAnsweredByCurrentUserAboutPartner === 0) {
            // No questions answered yet about the partner, so score is 0.
            return res.json({
                scorePercentage: 0,
                totalAnswered: 0,
                totalCorrect: 0,
                aboutWhom: partner.username // For context on the frontend
            });
        }

        const totalCorrectAnswersByCurrentUser = relevantQuestions.filter(q => q.answeredCorrectly === true).length;
        const scorePercentage = Math.round((totalCorrectAnswersByCurrentUser / totalAnsweredByCurrentUserAboutPartner) * 100);

        res.json({
            scorePercentage,
            totalAnswered: totalAnsweredByCurrentUserAboutPartner,
            totalCorrect: totalCorrectAnswersByCurrentUser,
            aboutWhom: partner.username // For context: "Your score about [Partner's Name]"
        });

    } catch (error) {
        console.error(`Error calculating score for user ${req.params.userId}:`, error);
        res.status(500).json({ message: 'Server error while calculating score.' });
    }
};
