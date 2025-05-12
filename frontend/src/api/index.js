// --- frontend/src/api/index.js ---
// Centralized API call management using Axios

import axios from 'axios';

// --- Handling API Base URL for Development and Production ---

// 1. Production (Vercel):
//    When your frontend is deployed on Vercel, you will set an environment variable
//    named `VITE_API_BASE_URL` in your Vercel project settings.
//    This variable will hold the URL of your deployed backend API
//    (e.g., https://your-backend-name.vercel.app/api).
//    `import.meta.env.VITE_API_BASE_URL` will read this value.

// 2. Local Development:
//    When running `npm run dev` locally, if `VITE_API_BASE_URL` is not set
//    (e.g., you don't have a .env file in `frontend/` with this variable, or it's not
//    set in your terminal environment), the `||` (OR) operator provides a fallback.
//    The fallback `'http://localhost:5001/api'` will be used, which points to your
//    local backend server.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

console.log(`API Base URL is: ${API_BASE_URL}`); // For debugging, you can see which URL is being used

// Create an Axios instance with the determined base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // You can add other default headers here if needed
  },
});

// --- User API Calls ---

/**
 * Fetches all users (Shivam and Shreya).
 */
export const getAllUsers = () => apiClient.get('/users');

/**
 * Fetches a specific user by their username.
 */
export const getUserByUsername = (username) => apiClient.get(`/users/${username}`);

/**
 * Fetches a specific user by their ID.
 */
export const getUserById = (userId) => apiClient.get(`/users/id/${userId}`);


// --- Question API Calls ---

/**
 * Creates a new question.
 */
export const createQuestion = (questionData) => apiClient.post('/questions', questionData);

/**
 * Fetches unanswered questions for a specific user.
 */
export const getUnansweredQuestions = (userId) => apiClient.get(`/questions/for/${userId}`);

/**
 * Submits an answer for a specific question.
 */
export const submitAnswer = (questionId, answerData) => apiClient.post(`/questions/${questionId}/answer`, answerData);

/**
 * Fetches the knowledge score for a specific user.
 */
export const getUserScore = (userId) => apiClient.get(`/questions/score/${userId}`);

