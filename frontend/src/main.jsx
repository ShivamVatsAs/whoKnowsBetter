// --- frontend/src/main.jsx ---
// This is the primary JavaScript entry point for your React application.

import React from 'react';
import ReactDOM from 'react-dom/client'; // Import for React 18+ createRoot API
import App from './App.jsx'; // Your main application component

// It's common to import global styles either here or in App.jsx.
// If your `frontend/src/styles/index.css` is already imported in `App.jsx`,
// you don't strictly need to import it again here. However, importing it
// here ensures styles are loaded very early.
// import './styles/index.css';

// Get the root DOM element from your `index.html` file.
// This is where your React application will be "mounted" or attached.
const rootElement = document.getElementById('root');

// Ensure the root element exists in your HTML before trying to render the app.
if (rootElement) {
  // Create a root for the React application using the ReactDOM.createRoot API.
  // This is the standard way for React 18 and later.
  const root = ReactDOM.createRoot(rootElement);

  // Render your main <App /> component into the root.
  // React.StrictMode is a wrapper that helps with identifying potential problems
  // in an application during development. It doesn't affect the production build.
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // Log an error if the root element isn't found. This usually means there's
  // an issue with your `index.html` file (e.g., missing <div id="root"></div>).
  console.error("Fatal Error: The root element with ID 'root' was not found in your HTML. React application cannot be mounted.");
}
