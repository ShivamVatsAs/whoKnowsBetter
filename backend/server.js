// --- backend/server.js ---
// Main entry point for the Express.js backend application
// Designed for both local development and Vercel deployment

const express = require('express');
const dotenv = require('dotenv'); // For loading environment variables from .env file
const cors = require('cors');     // For enabling Cross-Origin Resource Sharing
const connectDB = require('./config/db'); // Our database connection function

// --- Load Environment Variables ---
dotenv.config();

// --- Initialize Express App ---
const app = express();

// --- Connect to MongoDB ---
// This is called when the module loads. If it throws an error (e.g., can't connect),
// the serverless function might fail to initialize properly.
connectDB().catch(err => {
  // This catch is important for an unhandled promise rejection if connectDB itself fails
  // and isn't awaited at the top level of a request-response cycle.
  console.error('[SERVER_INIT] CRITICAL: Failed to connect to MongoDB during initial setup.', err);
  // In a serverless environment, you might not be able to gracefully process.exit().
  // The function will likely fail to serve requests if DB is down.
  // Vercel should log this console error.
});


// --- Middleware ---

// CORS Configuration:
const allowedOrigins = [
  'http://localhost:5173', // Your local frontend development server
];

if (process.env.VERCEL_URL && process.env.NODE_ENV === 'production') {
  if (!allowedOrigins.includes(`https://${process.env.VERCEL_URL}`)) {
      allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
  }
}
if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}


app.use(cors({
  origin: function (origin, callback) {
    if (!origin && process.env.NODE_ENV !== 'production') {
        return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`;
      console.warn("[CORS_REJECTION] " + msg); // Log as warn, not error, as this is a policy rejection
      callback(new Error(msg), false); // This error will be caught by the global error handler
    }
  },
  credentials: true
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
// If connectDB() failed, these routes might still be mounted but Mongoose operations will fail.
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);

// --- Basic Not Found (404) Handler ---
app.use((req, res, next) => {
  // If no routes matched, create a 404 error and pass it to the global error handler
  const error = new Error(`Endpoint not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// --- Global Error Handling Middleware ---
// This catches errors passed by next(err) in your route handlers.
app.use((err, req, res, next) => {
  console.error("--- GLOBAL ERROR HANDLER CAUGHT ---");
  console.error("Timestamp:", new Date().toISOString());
  console.error("Request URL:", req.originalUrl);
  console.error("Request Method:", req.method);
  console.error("Error Name:", err.name);
  console.error("Error Message:", err.message);
  console.error("Error Object:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2)); // Stringify to see all properties
  console.error("Error Stack:", err.stack);

  const statusCode = err.statusCode || 500;
  
  // Send a more generic message for actual 500s in production to avoid leaking details
  const responseMessage = (statusCode === 500 && process.env.NODE_ENV === 'production') 
                          ? 'An unexpected server error occurred. Please check server logs.' 
                          : (err.message || 'An error occurred.');

  res.status(statusCode).json({
    message: responseMessage,
    // Optionally, if you want to provide a reference for yourself:
    // errorId: req.headers['x-vercel-id'] // Vercel request ID
  });
});

// --- Conditionally Start the Server for Local Development ---
if (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'development') {
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
module.exports = app;
