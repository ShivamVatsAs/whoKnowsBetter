// --- frontend/src/App.jsx ---
// Main application component that handles view routing and global state.

import React, { useState, useEffect } from 'react';
import UserSelection from './components/UserSelection';
import Dashboard from './components/Dashboard';
import QuestionForm from './components/QuestionForm';
import './styles/index.css'; // Import global styles (create this file next)

// Define constants for different views/pages to avoid magic strings
const VIEWS = {
  USER_SELECTION: 'USER_SELECTION',
  DASHBOARD: 'DASHBOARD',
  CREATE_QUESTION: 'CREATE_QUESTION',
};

// Basic inline styles for the main layout - consider moving to index.css or App.css
const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh', // Ensure app takes at least full viewport height
    backgroundColor: '#fdf6f8', // A very light, almost unnoticeable pink background for the whole page
    fontFamily: '"Inter", sans-serif', // Global font
  },
  header: {
    backgroundColor: '#ad1457', // A rich, deep pink for the header
    padding: '1.2rem clamp(1rem, 5vw, 3rem)', // Responsive padding
    color: 'white',
    textAlign: 'center',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
    zIndex: 10, // Ensure header stays on top if other elements have z-index
  },
  headerTitle: {
    margin: 0,
    fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', // Responsive font size
    fontWeight: 'bold',
    letterSpacing: '0.5px',
  },
  mainContent: {
    flexGrow: 1, // Allows main content to expand and push footer down
    padding: '1rem 0', // Add some vertical padding around the main view
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Center the content horizontally
    width: '100%',
  },
  footer: {
    textAlign: 'center',
    padding: '1.5rem clamp(1rem, 5vw, 3rem)',
    marginTop: 'auto', // Pushes footer to the bottom if content is short
    backgroundColor: '#f8bbd0', // Lighter pink for the footer
    color: '#5c002a', // Darker pink text for contrast on light pink background
    fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
    borderTop: '2px solid #f48fb1', // A slightly darker pink border
  }
};

function App() {
  // State to keep track of the currently selected user object ({ _id, username })
  const [currentUser, setCurrentUser] = useState(null);
  // State to manage which view (component) is currently active
  const [currentView, setCurrentView] = useState(VIEWS.USER_SELECTION);

  // Effect to log view changes (for debugging or analytics)
  useEffect(() => {
    console.log("Current view:", currentView);
    console.log("Current user:", currentUser);
    // Potentially scroll to top when view changes
    window.scrollTo(0, 0);
  }, [currentView, currentUser]);


  // --- Navigation Handlers ---

  // Called from UserSelection when a user (Shivam or Shreya) is chosen
  const handleUserSelect = (user) => {
    if (user && user._id && user.username) {
      setCurrentUser(user);
      setCurrentView(VIEWS.DASHBOARD); // Navigate to the Dashboard
    } else {
      console.error("Invalid user object received from UserSelection:", user);
      // Optionally, reset to user selection or show an error
      setCurrentUser(null);
      setCurrentView(VIEWS.USER_SELECTION);
    }
  };

  // Called from Dashboard to go back to the UserSelection screen
  const handleSwitchUser = () => {
    setCurrentUser(null); // Clear the current user
    setCurrentView(VIEWS.USER_SELECTION);
  };

  // Called from Dashboard to navigate to the QuestionForm
  const handleNavigateToCreate = () => {
    if (currentUser) { // Ensure a user is selected before allowing question creation
      setCurrentView(VIEWS.CREATE_QUESTION);
    } else {
      // This case should ideally not happen if navigation is managed correctly
      console.warn("Attempted to navigate to create question without a current user.");
      setCurrentView(VIEWS.USER_SELECTION); // Redirect to user selection
    }
  };

  // Called from QuestionForm when a question is successfully created or user wants to go back
  const handleQuestionCreatedOrBack = () => {
    if (currentUser) {
      setCurrentView(VIEWS.DASHBOARD); // Go back to the Dashboard
    } else {
      // If somehow currentUser is lost, go back to selection
      setCurrentView(VIEWS.USER_SELECTION);
    }
  };

  // --- View Rendering Logic ---
  const renderView = () => {
    // Ensure currentUser is available for views that require it
    if ((currentView === VIEWS.DASHBOARD || currentView === VIEWS.CREATE_QUESTION) && !currentUser) {
      // If trying to access dashboard/create form without a user, redirect to selection
      // This is a safeguard.
      console.warn(`Redirecting to User Selection. Attempted to access ${currentView} without a user.`);
      setCurrentView(VIEWS.USER_SELECTION); // Update state to trigger re-render
      return <UserSelection onUserSelect={handleUserSelect} />; // Render UserSelection immediately
    }

    switch (currentView) {
      case VIEWS.USER_SELECTION:
        return <UserSelection onUserSelect={handleUserSelect} />;
      case VIEWS.DASHBOARD:
        return (
          <Dashboard
            currentUser={currentUser}
            onSwitchUser={handleSwitchUser}
            onNavigateToCreate={handleNavigateToCreate}
          />
        );
      case VIEWS.CREATE_QUESTION:
        return (
          <QuestionForm
            currentUser={currentUser}
            onQuestionCreatedOrBack={handleQuestionCreatedOrBack}
          />
        );
      default:
        // Fallback to UserSelection if view is unknown
        console.warn(`Unknown view: ${currentView}. Defaulting to User Selection.`);
        setCurrentView(VIEWS.USER_SELECTION); // Correct the state
        return <UserSelection onUserSelect={handleUserSelect} />;
    }
  };

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Couple's Quiz Connect ❤️</h1>
      </header>

      <main style={styles.mainContent}>
        {renderView()}
      </main>

      <footer style={styles.footer}>
        <p>Shrey❤️</p>
        <p>&copy; {new Date().getFullYear()} Shivam & Shreya</p>
      </footer>
    </div>
  );
}

export default App;
