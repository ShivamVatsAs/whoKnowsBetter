// --- frontend/src/components/Dashboard.jsx ---
// Displays the user's main view: score, questions for them, and navigation.

import React, { useState, useEffect, useCallback } from 'react';
import { getUnansweredQuestions, getUserScore } from '../api'; // API functions
import QuestionDisplay from './QuestionDisplay'; // Component to show/answer a single question

// Basic inline styles - consider moving to a CSS file or using Tailwind
const styles = {
  dashboard: {
    padding: '1.5rem clamp(1rem, 5vw, 3rem)', // Responsive padding
    maxWidth: '900px',
    margin: '1rem auto',
    backgroundColor: '#fff0f6', // Very light pink background, soft
    borderRadius: '16px', // Softer, larger border radius
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 5px 10px rgba(0, 0, 0, 0.04)', // Softer shadow
    fontFamily: '"Inter", sans-serif',
  },
  header: {
    display: 'flex',
    flexDirection: 'column', // Stack elements vertically on small screens
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align to start for column layout
    gap: '0.5rem', // Space between welcome and score if stacked
    borderBottom: '2px solid #f48fb1', // Pink border, slightly softer
    paddingBottom: '1rem',
    marginBottom: '2rem',
  },
  welcome: {
    fontSize: 'clamp(1.5rem, 4vw, 2rem)', // Responsive font size
    color: '#c2185b', // Darker pink for heading
    margin: 0,
    fontWeight: 'bold',
  },
  scoreContainer: {
    width: '100%', // Take full width for better layout control
    textAlign: 'left', // Align score text to left, or 'right' if preferred
  },
  score: {
    fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', // Responsive font size
    fontWeight: '600', // Semi-bold
    color: '#333',
    backgroundColor: '#fce4ec', // Lighter pink for score box
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    display: 'inline-block', // To allow padding and border-radius
    marginTop: '0.5rem', // Add some space if stacked below welcome
  },
  scoreDetails: {
    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
    marginLeft: '10px',
    color: '#ad1457', // Darker pink for details
  },
  actionsContainer: {
    display: 'flex',
    flexWrap: 'wrap', // Allow buttons to wrap on smaller screens
    gap: '1rem', // Space between buttons
    marginBottom: '2rem',
    justifyContent: 'center', // Center buttons if they wrap
  },
  button: {
    padding: '0.8rem 1.5rem',
    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#ec407a', // Medium Pink
    color: 'white',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  // Hover styles will be managed by state
  sectionTitle: {
    fontSize: 'clamp(1.3rem, 3.5vw, 1.7rem)',
    color: '#c2185b',
    marginTop: '2.5rem',
    marginBottom: '1.5rem',
    borderBottom: '1px dashed #f8bbd0',
    paddingBottom: '0.5rem',
  },
  noQuestions: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: '#fff9fb',
    borderRadius: '8px',
  },
  questionList: {
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem', // Space between question components
  },
  loadingText: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#555',
    padding: '2rem',
  },
  errorText: {
    color: 'red',
    backgroundColor: '#ffebee',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid red',
    textAlign: 'center',
    margin: '1rem 0',
  },
};

// Media query for larger screens (adjust breakpoint as needed)
const mediaQueryLarge = '@media (min-width: 600px)';
styles.header[mediaQueryLarge] = {
  flexDirection: 'row', // Side-by-side on larger screens
  alignItems: 'center', // Align items vertically in the center
};
styles.scoreContainer[mediaQueryLarge] = {
    textAlign: 'right', // Align score to the right on larger screens
    marginTop: 0, // Reset margin
};


function Dashboard({ currentUser, onSwitchUser, onNavigateToCreate }) {
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);
  const [scoreData, setScoreData] = useState({ scorePercentage: 0, totalAnswered: 0, totalCorrect: 0, aboutWhom: '' });
  const [loadingState, setLoadingState] = useState({ questions: true, score: true });
  const [error, setError] = useState(null);
  const [hoverStates, setHoverStates] = useState({}); // For button hover effects

  // Determine partner's name based on the current user
  const partnerName = currentUser?.username === 'Shivam' ? 'Shreya' : 'Shivam';

  // useCallback to memoize fetchData function
  const fetchData = useCallback(async () => {
    if (!currentUser?._id) {
      console.log("Current user or user ID is missing, skipping fetch.");
      setLoadingState({ questions: false, score: false }); // Ensure loading stops
      return;
    }

    setLoadingState({ questions: true, score: true });
    setError(null);

    try {
      // Fetch questions and score in parallel
      const [questionsRes, scoreRes] = await Promise.all([
        getUnansweredQuestions(currentUser._id),
        getUserScore(currentUser._id)
      ]);

      setUnansweredQuestions(Array.isArray(questionsRes.data) ? questionsRes.data : []);
      setScoreData(scoreRes.data || { scorePercentage: 0, totalAnswered: 0, totalCorrect: 0, aboutWhom: partnerName });

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      const errorMessage = err.response?.data?.message || "Could not load dashboard data. Please try again later.";
      setError(errorMessage);
      setUnansweredQuestions([]); // Reset on error
      setScoreData({ scorePercentage: 0, totalAnswered: 0, totalCorrect: 0, aboutWhom: partnerName }); // Reset on error
    } finally {
      setLoadingState({ questions: false, score: false });
    }
  }, [currentUser?._id, partnerName]); // Dependencies for useCallback

  // useEffect to call fetchData when currentUser changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Callback for when an answer is submitted in QuestionDisplay
  const handleAnswerSubmitted = () => {
    // Refetch both questions (to remove the answered one) and the score
    // Adding a small delay to allow backend to process and give user feedback time
    setTimeout(() => {
        fetchData();
    }, 500); // 0.5 second delay
  };

  // Button hover handlers
  const handleMouseEnter = (key) => setHoverStates(prev => ({ ...prev, [key]: true }));
  const handleMouseLeave = (key) => setHoverStates(prev => ({ ...prev, [key]: false }));

  // Dynamic styles for buttons based on hover state
  const getButtonStyle = (key) => ({
    ...styles.button,
    backgroundColor: hoverStates[key] ? '#d81b60' : styles.button.backgroundColor, // Darker pink on hover
    transform: hoverStates[key] ? 'translateY(-2px)' : 'none',
  });

  const getSwitchUserButtonStyle = (key) => ({
      ...styles.button,
      backgroundColor: hoverStates[key] ? '#880e4f' : '#ad1457', // Even darker pink variants
      transform: hoverStates[key] ? 'translateY(-2px)' : 'none',
  });


  if (!currentUser) {
    // This case should ideally be handled by App.jsx routing, but as a fallback:
    return <div style={styles.loadingText}>Loading user data...</div>;
  }

  return (
    <div style={styles.dashboard}>
      {/* Apply media query styles directly for simplicity here, or use a CSS-in-JS lib that supports it */}
      <style>{`
        ${mediaQueryLarge} {
          .dashboard-header { flex-direction: row; align-items: center; }
          .dashboard-score-container { text-align: right; margin-top: 0; }
        }
      `}</style>
      <header style={styles.header} className="dashboard-header">
        <h1 style={styles.welcome}>Welcome, {currentUser.username}!</h1>
        <div style={styles.scoreContainer} className="dashboard-score-container">
          {loadingState.score ? (
            <p style={styles.score}>Loading score...</p>
          ) : error && !scoreData.aboutWhom ? ( // If score specific error
            <p style={styles.score}>Score unavailable</p>
          ) : (
            <p style={styles.score}>
              Your Knowledge Score
              <span style={styles.scoreDetails}>
                (about {scoreData.aboutWhom || partnerName}):
              </span> {scoreData.scorePercentage}%
              <span style={styles.scoreDetails}>
                ({scoreData.totalCorrect}/{scoreData.totalAnswered} correct)
              </span>
            </p>
          )}
        </div>
      </header>

      {error && <p style={styles.errorText}>{error}</p>}

      <div style={styles.actionsContainer}>
        <button
          onClick={onNavigateToCreate}
          style={getButtonStyle('create')}
          onMouseEnter={() => handleMouseEnter('create')}
          onMouseLeave={() => handleMouseLeave('create')}
          aria-label={`Create new question for ${partnerName}`}
        >
          Create Question for {partnerName}
        </button>
         <button
          onClick={onSwitchUser}
          style={getSwitchUserButtonStyle('switch')}
          onMouseEnter={() => handleMouseEnter('switch')}
          onMouseLeave={() => handleMouseLeave('switch')}
          aria-label="Switch user"
        >
          Switch User
        </button>
      </div>

      <h2 style={styles.sectionTitle}>Questions for You from {partnerName}:</h2>
      {loadingState.questions ? (
        <p style={styles.loadingText}>Loading questions...</p>
      ) : !error && unansweredQuestions.length === 0 ? (
        <p style={styles.noQuestions}>No new questions from {partnerName} right now. Lucky you (or maybe create one for them)!</p>
      ) : unansweredQuestions.length > 0 ? (
        <div style={styles.questionList}>
          {unansweredQuestions.map((question) => (
            <QuestionDisplay
              key={question._id}
              question={question}
              currentUserId={currentUser._id}
              onAnswerSubmitted={handleAnswerSubmitted} // Pass the callback
            />
          ))}
        </div>
      ) : null /* If error already shown, don't show no questions message */ }
    </div>
  );
}

export default Dashboard;