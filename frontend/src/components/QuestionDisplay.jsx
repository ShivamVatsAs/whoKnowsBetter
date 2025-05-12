// --- frontend/src/components/QuestionDisplay.jsx ---
// Component to display a single question and handle the answering process.

import React, { useState } from 'react';
import { submitAnswer } from '../api'; // API function to submit an answer

// Basic inline styles - consider moving to a CSS file or using Tailwind
const styles = {
  card: {
    border: '1px solid #f8bbd0', // Pink border, consistent
    borderRadius: '12px', // Slightly larger radius for a softer look
    padding: '1.5rem clamp(1rem, 4vw, 2rem)', // Responsive padding
    marginBottom: '1.5rem', // Space between question cards
    backgroundColor: '#ffffff', // White background for contrast and readability
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.07)', // Softer shadow
    fontFamily: '"Inter", sans-serif',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  },
  cardHover: { // Style for when hovering over the card (optional)
    // transform: 'translateY(-3px)',
    // boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
  },
  questionText: {
    fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', // Responsive font size
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '0.75rem',
    lineHeight: '1.4',
  },
  creatorText: {
      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
      color: '#777',
      marginBottom: '1.5rem',
      fontStyle: 'italic',
  },
  optionsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem', // Space between option labels
  },
  optionLabel: {
    display: 'flex', // Use flex for alignment
    alignItems: 'center', // Vertically center radio and text
    padding: '0.9rem 1.2rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
    backgroundColor: '#f9f9f9',
    color: '#444',
    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
  },
  // Hover and selected styles will be managed by state
  optionInput: { // Actual radio button
    marginRight: '0.8rem', // Space between radio and text
    accentColor: '#ec407a', // Pink color for the radio button
    transform: 'scale(1.2)',
    cursor: 'pointer',
    // For custom styled radio, you might hide this and style the label
  },
  submitButton: {
    padding: '0.9rem 1.8rem',
    fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#e91e63', // Stronger Pink
    color: 'white',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    marginTop: '1.8rem',
    display: 'inline-block',
    boxShadow: '0 2px 5px rgba(233, 30, 99, 0.2)',
  },
  // Hover styles managed by state
  feedbackMessage: { // Common styles for feedback
    marginTop: '1.5rem',
    padding: '1rem 1.2rem',
    borderRadius: '8px',
    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
    fontWeight: '500',
    textAlign: 'center',
  },
  feedbackCorrect: {
    backgroundColor: '#e8f5e9', // Light green
    color: '#1b5e20', // Darker green text
    border: '1px solid #a5d6a7',
  },
  feedbackIncorrect: {
    backgroundColor: '#ffebee', // Light red
    color: '#b71c1c', // Darker red text
    border: '1px solid #ef9a9a',
  },
  errorText: {
       color: '#c62828', // Dark red
       backgroundColor: '#ffcdd2', // Light red background
       fontSize: 'clamp(0.85rem, 2.2vw, 0.95rem)',
       marginTop: '1rem',
       padding: '0.8rem',
       borderRadius: '6px',
       textAlign: 'center',
   }
};


function QuestionDisplay({ question, currentUserId, onAnswerSubmitted }) {
  const [selectedOptionText, setSelectedOptionText] = useState(null); // Stores the text of the selected option
  const [submitting, setSubmitting] = useState(false);
  // Feedback: { type: 'correct' | 'incorrect', message: string, correctAnswerText?: string }
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');
  const [hoverStates, setHoverStates] = useState({}); // For button/option hover

  // Handle when a user clicks on an option's label or radio button
  const handleOptionChange = (optionText) => {
    if (feedback || submitting) return; // Don't allow changing answer after submission or while submitting
    setSelectedOptionText(optionText);
  };

  // Handle form submission to submit the answer
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOptionText || submitting || feedback) {
      if (!selectedOptionText) setError("Please select an answer before submitting.");
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const response = await submitAnswer(question._id, {
        userId: currentUserId, // The ID of the user who is answering
        submittedAnswerText: selectedOptionText,
      });

      // Backend response: { message: string, isCorrect: boolean, correctAnswerText: string }
      if (response.data.isCorrect) {
        setFeedback({ type: 'correct', message: 'Correct! 🎉 Well done!' });
      } else {
        setFeedback({
          type: 'incorrect',
          message: `Not quite! The correct answer was: "${response.data.correctAnswerText}"`,
          correctAnswerText: response.data.correctAnswerText
        });
      }

      // Notify parent (Dashboard) to refetch data after a delay to show feedback
      setTimeout(() => {
        if (onAnswerSubmitted) {
          onAnswerSubmitted(); // This will trigger data refresh in Dashboard
        }
        // Reset local state for this component if it were to be reused immediately,
        // but it will likely be removed from the list.
      }, 2500); // 2.5 seconds to show feedback

    } catch (err) {
      console.error("Error submitting answer:", err);
      setError(err.response?.data?.message || 'Failed to submit answer. Please try again.');
      setFeedback(null); // Clear any previous feedback on new error
    } finally {
      // Don't setSubmitting(false) immediately if feedback is shown,
      // as the component might be removed. If it stays, then set it.
      // For now, the component will be unmounted by parent.
      // If it were to stay, you might do:
      // if (!feedback) setSubmitting(false);
    }
  };

  // Hover handlers
  const handleMouseEnter = (key) => {
    if (feedback) return; // Disable hover effects after an answer is submitted
    setHoverStates(prev => ({ ...prev, [key]: true }));
  };
  const handleMouseLeave = (key) => setHoverStates(prev => ({ ...prev, [key]: false }));

  // Dynamic styles for options and buttons
  const getOptionLabelStyle = (optionText) => {
    let style = { ...styles.optionLabel };
    if (selectedOptionText === optionText) {
      style = { ...style, backgroundColor: '#fce4ec', borderColor: '#f48fb1', boxShadow: '0 0 5px rgba(244, 143, 177, 0.5)' };
    } else if (hoverStates[optionText] && !feedback) {
      style = { ...style, backgroundColor: '#f0f0f0', borderColor: '#ccc' };
    }
    if (feedback) { // After feedback is given
        const isCorrectOption = question.options.find(opt => opt.isCorrect)?.text === optionText;
        const isSelectedOption = selectedOptionText === optionText;

        if (isCorrectOption) {
            style = {...style, backgroundColor: '#c8e6c9', borderColor: '#81c784', color: '#1b5e20', fontWeight: 'bold'}; // Green for correct
        } else if (isSelectedOption && !feedback.isCorrect) {
            style = {...style, backgroundColor: '#ffcdd2', borderColor: '#e57373', color: '#b71c1c'}; // Red for selected incorrect
        } else {
             style = {...style, opacity: 0.7, cursor: 'default'}; // Dim other options
        }
    }
    return style;
  };

  const getSubmitButtonStyle = () => ({
    ...styles.submitButton,
    backgroundColor: hoverStates.submit && !feedback ? '#c2185b' : styles.submitButton.backgroundColor,
    transform: hoverStates.submit && !feedback ? 'translateY(-2px)' : 'none',
    opacity: (!selectedOptionText || submitting || feedback) ? 0.6 : 1,
    cursor: (!selectedOptionText || submitting || feedback) ? 'not-allowed' : 'pointer',
  });


  return (
    <div
        style={{...styles.card, ...(hoverStates.card && !feedback ? styles.cardHover : {})}}
        onMouseEnter={() => handleMouseEnter('card')}
        onMouseLeave={() => handleMouseLeave('card')}
        aria-labelledby={`question-text-${question._id}`}
        role="article"
    >
      <h3 style={styles.questionText} id={`question-text-${question._id}`}>{question.questionText}</h3>
      {question.createdBy?.username && (
        <p style={styles.creatorText}>Asked by: {question.createdBy.username}</p>
      )}

      <form onSubmit={handleSubmit} aria-labelledby={`question-text-${question._id}`}>
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ display: 'none' }}>Answer options for: {question.questionText}</legend>
          <div style={styles.optionsList} role="radiogroup">
            {question.options.map((option, index) => (
              <label
                key={index}
                htmlFor={`option-${question._id}-${index}`}
                style={getOptionLabelStyle(option.text)}
                onMouseEnter={() => handleMouseEnter(option.text)}
                onMouseLeave={() => handleMouseLeave(option.text)}
                className={selectedOptionText === option.text ? 'selected' : ''}
                aria-checked={selectedOptionText === option.text}
              >
                <input
                  type="radio"
                  id={`option-${question._id}-${index}`}
                  name={`question_${question._id}`} // Unique name for radio group per question
                  value={option.text}
                  checked={selectedOptionText === option.text}
                  onChange={() => handleOptionChange(option.text)}
                  disabled={submitting || !!feedback} // Disable after submitting or if feedback is shown
                  style={styles.optionInput}
                  aria-label={option.text}
                />
                {option.text}
              </label>
            ))}
          </div>
        </fieldset>

        {error && <p style={styles.errorText} role="alert">{error}</p>}

        {feedback && (
          <div
            style={{
              ...styles.feedbackMessage,
              ...(feedback.type === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect)
            }}
            role="alert"
          >
            {feedback.message}
          </div>
        )}

        {!feedback && ( // Only show submit button if no feedback has been given yet
          <button
            type="submit"
            disabled={!selectedOptionText || submitting || !!feedback}
            style={getSubmitButtonStyle()}
            onMouseEnter={() => handleMouseEnter('submit')}
            onMouseLeave={() => handleMouseLeave('submit')}
          >
            {submitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        )}
      </form>
    </div>
  );
}

export default QuestionDisplay;
