// --- frontend/src/components/UserSelection.jsx ---
// Component to allow the user to select who is currently playing.

import React, { useState, useEffect } from 'react';
// CORRECTED IMPORT: Changed 'getAlllisers' to 'getAllUsers'
import { getAllUsers } from '../api'; // API function to fetch users

// Basic inline styles - consider moving to a CSS file or using Tailwind for better organization
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 150px)', // Adjust based on header/footer height
    padding: '2rem',
    textAlign: 'center',
    fontFamily: '"Inter", sans-serif', // Consistent font
  },
  title: {
    fontSize: 'clamp(2rem, 5vw, 2.8rem)', // Responsive font size
    color: '#c2185b', // A deep pink, consistent with the theme
    marginBottom: '2.5rem',
    fontWeight: 'bold',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row', // Keep buttons side-by-side on larger screens
    gap: '1.5rem', // Spacing between buttons
    flexWrap: 'wrap', // Allow buttons to wrap on smaller screens
    justifyContent: 'center',
  },
  button: {
    padding: '1rem 2.5rem',
    fontSize: 'clamp(1rem, 3vw, 1.3rem)', // Responsive font size
    cursor: 'pointer',
    border: '2px solid #f06292', // Pink border
    borderRadius: '10px', // More rounded corners
    backgroundColor: '#f8bbd0', // Light Pink base for buttons
    color: '#880e4f', // Darker pink text for contrast
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow
    minWidth: '150px', // Ensure buttons have a decent minimum width
  },
  // Hover effect will be managed by a state variable for dynamic styling
  loadingText: {
    fontSize: '1.2rem',
    color: '#555',
  },
  errorText: {
    fontSize: '1.1rem',
    color: 'red',
    backgroundColor: '#ffebee',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid red',
  }
};

function UserSelection({ onUserSelect }) {
  const [users, setUsers] = useState([]); // To store the fetched users (Shivam, Shreya)
  const [loading, setLoading] = useState(true); // To show a loading state
  const [error, setError] = useState(null); // To display any errors during fetching
  const [hoveredUser, setHoveredUser] = useState(null); // To manage hover styles for buttons

  // useEffect hook to fetch users when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        const response = await getAllUsers(); // Call the API
        // Ensure response.data is an array before setting users
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          console.error("API did not return an array of users:", response.data);
          setUsers([]); // Set to empty array if data is not as expected
          setError("Received invalid data format for users.");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        // Provide a user-friendly error message
        setError(err.response?.data?.message || "Could not load users. Please ensure the backend server is running and accessible.");
        setUsers([]); // Clear users on error
      } finally {
        setLoading(false); // Stop loading state
      }
    };

    fetchUsers();
  }, []); // Empty dependency array means this effect runs once after the initial render

  // Handler for button hover
  const handleMouseEnter = (username) => {
    setHoveredUser(username);
  };

  const handleMouseLeave = () => {
    setHoveredUser(null);
  };

  // Render loading state
  if (loading) {
    return <div style={styles.container}><p style={styles.loadingText}>Loading users...</p></div>;
  }

  // Render error state
  if (error) {
    return <div style={styles.container}><p style={styles.errorText}>{error}</p></div>;
  }

  // Render message if no users are found (and not loading/error)
  if (users.length === 0) {
    return (
      <div style={styles.container}>
        <p style={styles.errorText}>
          No users found. Please ensure Shivam and Shreya have been created in the database by the backend.
        </p>
      </div>
    );
  }

  // Render user selection buttons
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Who's Playing Today?</h1>
      <div style={styles.buttonContainer}>
        {users.map((user) => (
          <button
            key={user._id} // Unique key for each button
            onClick={() => onUserSelect(user)} // Callback when a user is selected
            style={{
              ...styles.button,
              // Apply hover styles dynamically
              backgroundColor: hoveredUser === user.username ? '#f48fb1' : styles.button.backgroundColor, // Darker pink on hover
              transform: hoveredUser === user.username ? 'translateY(-3px)' : 'none', // Slight lift effect
              boxShadow: hoveredUser === user.username ? '0 6px 12px rgba(0, 0, 0, 0.15)' : styles.button.boxShadow,
            }}
            onMouseEnter={() => handleMouseEnter(user.username)}
            onMouseLeave={handleMouseLeave}
            aria-label={`Select user ${user.username}`} // Accessibility
          >
            {user.username}
          </button>
        ))}
      </div>
    </div>
  );
}

export default UserSelection;
