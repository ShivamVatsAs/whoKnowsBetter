// --- frontend/src/components/QuestionForm.jsx ---
// Component for creating a new question for the partner.

import React, { useState, useEffect } from 'react';
import { createQuestion, getAllUsers } from '../api'; // API functions

// Basic inline styles - consider moving to a CSS file or using Tailwind
const styles = {
  formContainer: {
    padding: '1.5rem clamp(1rem, 5vw, 3rem)',
    maxWidth: '700px',
    margin: '1rem auto',
    backgroundColor: '#fff8fa', // Very light, almost white pink
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 5px 10px rgba(0, 0, 0, 0.04)',
    fontFamily: '"Inter", sans-serif',
  },
  title: {
    fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
    color: '#c2185b', // Darker pink
    textAlign: 'center',
    marginBottom: '2rem',
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: '1.8rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.6rem',
    fontWeight: 'bold',
    color: '#4a148c', // A deep purple for labels, complements pink
    fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
  },
  input: {
    width: '100%',
    padding: '0.9rem 1rem',
    border: '1px solid #f8bbd0', // Pink border
    borderRadius: '8px',
    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  },
  textarea: {
    width: '100%',
    padding: '0.9rem 1rem',
    border: '1px solid #f8bbd0',
    borderRadius: '8px',
    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
    minHeight: '100px',
    boxSizing: 'border-box',
    resize: 'vertical',
    backgroundColor: '#fff',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  },
  inputFocus: { // Style for focused input/textarea
    borderColor: '#ec407a', // Brighter pink on focus
    boxShadow: '0 0 0 3px rgba(236, 64, 122, 0.2)', // Pink glow
  },
  optionsContainer: {
    marginTop: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  optionInputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.8rem',
    backgroundColor: '#fff0f6', // Very light pink for option background
    borderRadius: '8px',
    border: '1px dashed #fcc2d7'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: 'clamp(0.85rem, 2.2vw, 0.95rem)',
    color: '#555',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '6px',
    transition: 'background-color 0.2s ease',
  },
  radioInput: {
    accentColor: '#ec407a', // Pink color for the radio button
    transform: 'scale(1.3)',
    cursor: 'pointer',
    marginRight: '0.3rem',
  },
  actionButton: { // General style for add/remove buttons
    padding: '0.7rem 1.2rem',
    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600', // Semi-bold
    transition: 'background-color 0.3s ease, transform 0.2s ease',
  },
  addButton: {
    backgroundColor: '#e1f5fe', // Light blue for add - contrast
    color: '#0277bd', // Darker blue text
  },
  removeButton: {
    backgroundColor: '#ffebee', // Light red for remove
    color: '#c62828', // Darker red text
    marginLeft: 'auto', // Push remove button to the right if space allows
  },
  submitButton: {
    padding: '1rem 2rem',
    fontSize: 'clamp(1rem, 2.8vw, 1.15rem)',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#e91e63', // Stronger Pink
    color: 'white',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    display: 'block',
    width: '100%',
    marginTop: '2.5rem',
    boxShadow: '0 4px 10px rgba(233, 30, 99, 0.3)',
  },
  backButton: {
    padding: '0.8rem 1.8rem',
    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
    cursor: 'pointer',
    borderRadius: '8px',
    backgroundColor: '#bdbdbd', // Grey for back button
    color: '#424242', // Dark grey text
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    display: 'inline-block',
    width: 'auto',
    marginTop: '1.5rem',
    border: 'none',
  },
  // Hover styles managed by state
  messageText: { // For success or error messages
    fontSize: 'clamp(0.9rem, 2.2vw, 1rem)',
    marginTop: '1.5rem',
    padding: '0.8rem 1rem',
    borderRadius: '6px',
    textAlign: 'center',
  },
  errorText: {
    backgroundColor: '#ffebee', // Light red
    color: '#c62828', // Dark red text
    border: '1px solid #ef9a9a',
  },
  successText: {
    backgroundColor: '#e8f5e9', // Light green
    color: '#2e7d32', // Dark green text
    border: '1px solid #a5d6a7',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#555',
    padding: '2rem',
  },
  focused: {}, // Placeholder for focus class if needed with CSS modules/Tailwind
};


function QuestionForm({ currentUser, onQuestionCreatedOrBack }) {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([
    { text: '', isCorrect: false }, // Initial two options
    { text: '', isCorrect: false },
  ]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null); // Index of the correct option
  const [partner, setPartner] = useState(null); // To store the partner user object
  const [loadingPartner, setLoadingPartner] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hoverStates, setHoverStates] = useState({});
  const [focusedElement, setFocusedElement] = useState(null); // For input focus styles

  // Fetch the partner's user object to get their ID and name
  useEffect(() => {
    const fetchPartner = async () => {
      if (!currentUser?._id) {
        setError("Current user information is missing.");
        setLoadingPartner(false);
        return;
      }
      setLoadingPartner(true);
      try {
        const response = await getAllUsers(); // API returns array of users
        const partnerUser = response.data.find(user => user._id !== currentUser._id);
        if (partnerUser) {
          setPartner(partnerUser);
        } else {
          setError("Could not find partner information. Ensure both users exist.");
        }
      } catch (err) {
        console.error("Error fetching partner:", err);
        setError(err.response?.data?.message || "Could not load partner information.");
      } finally {
        setLoadingPartner(false);
      }
    };
    fetchPartner();
  }, [currentUser]);

  // Handle text change for an option
  const handleOptionChange = (index, value) => {
    const newOptions = options.map((opt, i) =>
      i === index ? { ...opt, text: value } : opt
    );
    setOptions(newOptions);
  };

  // Handle selection of the correct answer
  const handleCorrectAnswerChange = (index) => {
    setCorrectAnswerIndex(index);
    // Also update the isCorrect flag in the options array directly
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(newOptions);
  };

  // Add a new option field (up to 4 options)
  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, { text: '', isCorrect: false }]);
    }
  };

  // Remove an option field (minimum 2 options)
  const removeOption = (indexToRemove) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== indexToRemove);
      setOptions(newOptions);
      // If the removed option was the correct one, reset correctAnswerIndex
      if (correctAnswerIndex === indexToRemove) {
        setCorrectAnswerIndex(null);
      } else if (correctAnswerIndex > indexToRemove) {
        // Adjust index if an option before the correct one was removed
        setCorrectAnswerIndex(correctAnswerIndex - 1);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // --- Validations ---
    if (!questionText.trim()) {
      setError('Please enter the question text.');
      return;
    }
    if (options.some(opt => !opt.text.trim())) {
      setError('Please fill in all answer options.');
      return;
    }
    if (correctAnswerIndex === null || correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
      setError('Please mark one answer as correct.');
      return;
    }
    if (!currentUser?._id || !partner?._id) {
        setError('User or partner information is missing. Cannot create question.');
        return;
    }

    // Ensure the options array sent to backend has the correct `isCorrect` flags
    const finalOptions = options.map((opt, index) => ({
        text: opt.text,
        isCorrect: index === correctAnswerIndex
    }));

    const questionData = {
      questionText,
      options: finalOptions,
      createdByUserId: currentUser._id,
      intendedForUserId: partner._id,
    };

    setSubmitting(true);
    try {
      await createQuestion(questionData);
      setSuccessMessage(`Question for ${partner.username} created successfully!`);
      // Reset form fields
      setQuestionText('');
      setOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
      setCorrectAnswerIndex(null);
      // Optionally, clear success message after a few seconds and navigate
      setTimeout(() => {
        setSuccessMessage('');
        if (onQuestionCreatedOrBack) onQuestionCreatedOrBack(); // Navigate back
      }, 2000); // 2 seconds
    } catch (err) {
      console.error("Error creating question:", err);
      setError(err.response?.data?.message || 'Failed to create question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Hover and focus handlers
  const handleMouseEnter = (key) => setHoverStates(prev => ({ ...prev, [key]: true }));
  const handleMouseLeave = (key) => setHoverStates(prev => ({ ...prev, [key]: false }));
  const handleFocus = (elementName) => setFocusedElement(elementName);
  const handleBlur = () => setFocusedElement(null);


  // Dynamic styles for buttons
  const getActionButtonStyle = (key, type) => {
    const baseStyle = type === 'add' ? styles.addButton : styles.removeButton;
    return {
        ...styles.actionButton,
        ...baseStyle,
        backgroundColor: hoverStates[key] ? (type === 'add' ? '#b3e5fc' : '#ffcdd2') : baseStyle.backgroundColor,
        transform: hoverStates[key] ? 'scale(1.05)' : 'none',
    };
  };
  const getSubmitButtonStyle = () => ({
    ...styles.submitButton,
    backgroundColor: hoverStates.submit ? '#c2185b' : styles.submitButton.backgroundColor,
    transform: hoverStates.submit ? 'translateY(-2px)' : 'none',
    opacity: submitting ? 0.7 : 1,
    cursor: submitting ? 'wait' : 'pointer',
  });
   const getBackButtonStyle = () => ({
    ...styles.backButton,
    backgroundColor: hoverStates.back ? '#a0a0a0' : styles.backButton.backgroundColor,
    transform: hoverStates.back ? 'translateY(-1px)' : 'none',
  });


  if (loadingPartner) {
    return <div style={{...styles.formContainer, ...styles.loadingText}}>Loading form...</div>;
  }
  if (!partner && !loadingPartner) { // If partner couldn't be loaded
    return (
      <div style={styles.formContainer}>
        <p style={{...styles.messageText, ...styles.errorText}}>{error || "Could not load partner information to create a question."}</p>
        <button
            onClick={onQuestionCreatedOrBack}
            style={getBackButtonStyle()}
            onMouseEnter={() => handleMouseEnter('back')}
            onMouseLeave={() => handleMouseLeave('back')}
        >
          Back to Dashboard
       </button>
      </div>
    );
  }

  return (
    <div style={styles.formContainer}>
      <h2 style={styles.title}>Create a Question for {partner?.username || 'your partner'}</h2>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label htmlFor="questionText" style={styles.label}>Your Question:</label>
          <textarea
            id="questionText"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            style={{...styles.textarea, ...(focusedElement === 'questionText' ? styles.inputFocus : {})}}
            onFocus={() => handleFocus('questionText')}
            onBlur={handleBlur}
            placeholder={`e.g., What is my favorite vacation spot?`}
            required
            rows={3}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Answer Options (2-4 options, mark one as correct):</label>
          <div style={styles.optionsContainer}>
            {options.map((option, index) => (
              <div key={index} style={styles.optionInputGroup}>
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  style={{...styles.input, flexGrow: 1, ...(focusedElement === `option-${index}` ? styles.inputFocus : {})}}
                  onFocus={() => handleFocus(`option-${index}`)}
                  onBlur={handleBlur}
                  placeholder={`Option ${index + 1}`}
                  required
                  aria-label={`Answer option ${index + 1}`}
                />
                 <label style={styles.radioLabel} htmlFor={`correctAnswer-${index}`}>
                    <input
                        type="radio"
                        id={`correctAnswer-${index}`}
                        name="correctAnswer" // Same name groups radio buttons
                        checked={correctAnswerIndex === index}
                        onChange={() => handleCorrectAnswerChange(index)}
                        style={styles.radioInput}
                        required={index === 0} // Only make first radio required for form validation to ensure one is picked
                        aria-labelledby={`correctAnswerLabel-${index}`}
                    />
                    <span id={`correctAnswerLabel-${index}`}>Correct</span>
                 </label>
                {options.length > 2 && ( // Show remove button only if more than 2 options
                  <button
                    type="button" // Important: type="button" to prevent form submission
                    onClick={() => removeOption(index)}
                    style={getActionButtonStyle(`remove-${index}`, 'remove')}
                    onMouseEnter={() => handleMouseEnter(`remove-${index}`)}
                    onMouseLeave={() => handleMouseLeave(`remove-${index}`)}
                    aria-label={`Remove option ${index + 1}`}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
           {options.length < 4 && ( // Show add button only if less than 4 options
             <button
                type="button"
                onClick={addOption}
                style={{...getActionButtonStyle('add', 'add'), marginTop: '1rem'}}
                onMouseEnter={() => handleMouseEnter('add')}
                onMouseLeave={() => handleMouseLeave('add')}
                aria-label="Add another answer option"
             >
                Add Option
            </button>
           )}
        </div>

        {error && <p style={{...styles.messageText, ...styles.errorText}}>{error}</p>}
        {successMessage && <p style={{...styles.messageText, ...styles.successText}}>{successMessage}</p>}

        <button
            type="submit"
            disabled={submitting || loadingPartner || !partner}
            style={getSubmitButtonStyle()}
            onMouseEnter={() => handleMouseEnter('submit')}
            onMouseLeave={() => handleMouseLeave('submit')}
        >
          {submitting ? 'Creating Question...' : `Create Question for ${partner?.username || ''}`}
        </button>
      </form>
       <button
            onClick={onQuestionCreatedOrBack} // Navigate back to dashboard
            style={getBackButtonStyle()}
            onMouseEnter={() => handleMouseEnter('back')}
            onMouseLeave={() => handleMouseLeave('back')}
            disabled={submitting}
        >
          Back to Dashboard
       </button>
    </div>
  );
}

export default QuestionForm;
