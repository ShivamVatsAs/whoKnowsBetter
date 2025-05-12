// --- backend/server.js ---
// Main entry point for the Express.js backend application
// Designed for both local development and Vercel deployment

const express = require('express');
const dotenv = require('dotenv'); // For loading environment variables from .env file
const cors = require('cors');     // For enabling Cross-Origin Resource Sharing
const connectDB = require('./config/db'); // Our database connection function

// --- Load Environment Variables ---
// For local development, this loads variables from your `backend/.env` file.
// On Vercel, environment variables are set in the project settings.
dotenv.config();

// --- Initialize Express App ---
const app = express();

// --- Connect to MongoDB ---
// This will use MONGO_URI from .env locally, or from Vercel's env vars when deployed.
connectDB();

// --- Middleware ---

// CORS Configuration:
const allowedOrigins = [
  'http://localhost:5173', // Your local frontend development server
  // IMPORTANT FOR PRODUCTION:
  // Add your Vercel frontend URL here AFTER it is deployed.
  // You can also set this via an environment variable on Vercel, e.g., process.env.FRONTEND_URL
  // Example: 'https://your-frontend-app-name.vercel.app'
];

// Dynamically add the Vercel frontend URL if available (more robust for preview deployments)
// VERCEL_URL is an environment variable automatically set by Vercel for preview deployments,
// containing the full URL of the deployment.
// For production deployments, you might have a custom domain or a specific Vercel URL.
// It's often best to set a specific FRONTEND_URL environment variable in Vercel for your production frontend.
if (process.env.VERCEL_URL && process.env.NODE_ENV === 'production') {
  // For Vercel preview deployments, the URL changes.
  // This attempts to allow the preview frontend to access the API.
  // Note: VERCEL_URL might be just the domain, so ensure you add https://
  // A more reliable method for production is to explicitly set FRONTEND_URL.
  if (!allowedOrigins.includes(`https://${process.env.VERCEL_URL}`)) {
      allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
  }
}
if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}


app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests during testing)
    if (!origin && process.env.NODE_ENV !== 'production') { // Be stricter in production
        return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`;
      console.error(msg); // Log CORS errors for debugging
      callback(new Error(msg), false);
    }
  },
  credentials: true // If you plan to use cookies or authorization headers
}));


// Parse JSON request bodies.
app.use(express.json());

// --- Import API Routes ---
const userRoutes = require('./routes/userRoutes');
const questionRoutes = require('./routes/questionRoutes');

// --- Define a Basic Welcome Route ---
app.get('/', (req, res) => {
  res.send('<h1>Couple\'s Quiz Connect API</h1><p>API is active.</p>');
});

// --- Mount API Routes ---
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);

// --- Basic Not Found (404) Handler ---
// This catches any requests that didn't match the routes above.
app.use((req, res, next) => {
  res.status(404).json({ message: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// --- Global Error Handling Middleware ---
// This catches errors passed by next(err) in your route handlers.
app.use((err, req, res, next) => {
  console.error("Global Error Handler Caught:", err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack); // Log full stack trace in development
  }

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'An unexpected server error occurred.',
    // Optionally, include stack trace in development for easier debugging
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// --- Conditionally Start the Server for Local Development ---
// The `app.listen` part is only for when you run the server directly (e.g., locally).
// Vercel handles the server listening part itself when deploying as a serverless function.
// `process.env.VERCEL_ENV` can be 'production', 'preview', or 'development' (when using `vercel dev`)
if (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'development') { // Run listen locally or with `vercel dev`
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`---- Backend Server (Local Development Mode) ----`);
    console.log(`Server successfully started in ${process.env.NODE_ENV || 'development'} mode.`);
    console.log(`API is running on: http://localhost:${PORT}`);
    console.log(`MongoDB URI: ${process.env.MONGO_URI ? 'Loaded' : 'NOT FOUND or NOT LOADED!'}`);
    console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
    console.log(`-----------------------------------------------`);
  });
}

// --- Export the Express App for Vercel ---
// This is the crucial part for Vercel. Vercel imports this `app` instance
// and uses it to handle incoming requests in its serverless environment.
module.exports = app;
