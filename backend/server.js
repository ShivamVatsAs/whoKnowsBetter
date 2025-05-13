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
connectDB().catch(err => {
  console.error('[SERVER_INIT] CRITICAL: Failed to connect to MongoDB during initial setup.', err);
});


// --- Middleware ---

// CORS Configuration (TEMPORARY DEBUGGING VERSION)
app.use(cors({
  origin: function (origin, callback) {
    console.log("[CORS_DEBUG] Request Origin Header:", origin); // Log the actual origin header Vercel sees
    
    const vercelFrontendUrl = process.env.FRONTEND_URL; // Should be https://who-knows-better.vercel.app
    const localFrontendUrl = 'http://localhost:5173';
    
    // --- Dynamically construct allowedOrigins for logging purposes inside this debug block ---
    // This isn't used for the actual check below in this debug version but helps see what *should* be allowed.
    const intendedAllowedOrigins = [localFrontendUrl];
    if (vercelFrontendUrl) {
        intendedAllowedOrigins.push(vercelFrontendUrl);
    }
    // Add VERCEL_URL for preview deployments if different and present
    if (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` !== vercelFrontendUrl && !intendedAllowedOrigins.includes(`https://${process.env.VERCEL_URL}`)) {
        intendedAllowedOrigins.push(`https://${process.env.VERCEL_URL}`);
    }
    // --- End of logging aid ---

    if (origin === vercelFrontendUrl || origin === localFrontendUrl || (process.env.VERCEL_URL && origin === `https://${process.env.VERCEL_URL}`)) {
      console.log("[CORS_DEBUG] Origin allowed by direct match:", origin);
      callback(null, true);
    } else if (!origin && process.env.NODE_ENV !== 'production') { // Allow undefined origin (like Postman, curl) only in local dev
      console.log("[CORS_DEBUG] No origin allowed in dev (e.g. Postman):", origin);
      callback(null, true);
    } else {
      console.warn(`[CORS_DEBUG] Origin rejected: '${origin}'. Intended allowed origins for matching: ${intendedAllowedOrigins.join(', ')}`);
      // Let the cors package handle the rejection properly by passing false in the callback.
      // This should result in the browser getting a standard CORS error, not a 500 from your global handler for this.
      callback(null, false);
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
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);

// --- Basic Not Found (404) Handler ---
app.use((req, res, next) => {
  const error = new Error(`Endpoint not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// --- Global Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error("--- GLOBAL ERROR HANDLER CAUGHT ---");
  console.error("Timestamp:", new Date().toISOString());
  console.error("Request URL:", req.originalUrl);
  console.error("Request Method:", req.method);
  console.error("Error Name:", err.name);
  console.error("Error Message:", err.message);
  // Stringify to see all enumerable properties of the error object
  console.error("Error Object:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2)); 
  console.error("Error Stack:", err.stack);

  const statusCode = err.statusCode || 500;
  
  const responseMessage = (statusCode === 500 && process.env.NODE_ENV === 'production') 
                          ? 'An unexpected server error occurred. Please check server logs.' 
                          : (err.message || 'An error occurred.');

  res.status(statusCode).json({
    message: responseMessage,
  });
});

// --- Conditionally Start the Server for Local Development ---
if (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'development') {
  const PORT = process.env.PORT || 5001;
  const currentAllowedOrigins = [ 'http://localhost:5173' ]; // Rebuild for local log
    if (process.env.FRONTEND_URL) { currentAllowedOrigins.push(process.env.FRONTEND_URL); }
    if (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` !== process.env.FRONTEND_URL) { currentAllowedOrigins.push(`https://${process.env.VERCEL_URL}`); }

  app.listen(PORT, () => {
    console.log(`---- Backend Server (Local Development Mode) ----`);
    console.log(`Server successfully started in ${process.env.NODE_ENV || 'development'} mode.`);
    console.log(`API is running on: http://localhost:${PORT}`);
    console.log(`MongoDB URI: ${process.env.MONGO_URI ? 'Loaded' : 'NOT FOUND or NOT LOADED!'}`);
    console.log(`Allowed CORS origins for local: ${currentAllowedOrigins.join(', ')}`);
    console.log(`-----------------------------------------------`);
  });
}

// --- Export the Express App for Vercel ---
module.exports = app;
