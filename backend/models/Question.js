// --- backend/models/Question.js ---
// Defines the schema for a Question
const mongoose = require('mongoose');

// Sub-schema for answer options within a question
// We use { _id: false } because these are embedded and don't need their own top-level IDs.
const answerSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Answer option text cannot be empty.'], // Added custom error message
    trim: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
    default: false,
  },
}, { _id: false });

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text cannot be empty.'], // Added custom error message
    trim: true,
    minlength: [5, 'Question text must be at least 5 characters long.'], // Example validation
  },
  options: {
    type: [answerSchema], // Array of possible answers using the sub-schema
    required: true,
    validate: [
      {
        validator: function(val) {
          // Ensures there are between 2 and 4 options
          return val.length >= 2 && val.length <= 4;
        },
        message: 'A question must have between 2 and 4 answer options.'
      },
      {
        validator: function(val) {
          // Ensures exactly one option is marked as correct
          return val.filter(opt => opt.isCorrect).length === 1;
        },
        message: 'Exactly one answer option must be marked as correct.'
      }
    ],
  },
  createdBy: { // User who created the question
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Creates a reference to the User model
    required: true,
  },
  intendedFor: { // User who should answer the question
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Creates a reference to the User model
    required: true,
  },
  answeredCorrectly: { // Track if the intended user answered it correctly
    type: Boolean,
    default: null, // null means unanswered, true means correct, false means incorrect
  },
  submittedAnswer: { // Store the text of the answer submitted by the intended user
      type: String,
      default: null, // null if unanswered
      trim: true,
  }
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps automatically

// Pre-save hook example (optional):
// Can be used for complex validation or data manipulation before saving.
// For instance, ensuring createdBy and intendedFor are not the same user.
questionSchema.pre('save', function(next) {
  if (this.createdBy && this.intendedFor && this.createdBy.equals(this.intendedFor)) {
    const err = new Error('Question creator and intended recipient cannot be the same person.');
    next(err);
  } else {
    next();
  }
});

module.exports = mongoose.model('Question', questionSchema);
