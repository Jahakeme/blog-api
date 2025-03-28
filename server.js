// Core dependencies
const express = require('express');      // Web framework for building the API server
const cookieParser = require('cookie-parser');  // Middleware to parse cookies for authentication

// Application modules
const connectdb = require('./database/mongodbController');  // Database connection handler
const errorHandler = require('./middlewares/errorHandler');  // Global error handling middleware

// API Routes
const adminRouter = require('./router/adminRouter');
const commentRouter = require('./router/commentRouter');
const postRouter = require('./router/postRouter');
const userRouter = require('./router/userRouter');

// Initialize Express application
const app = express();

// Load environment variables from .env file
require('dotenv').config();
const port = process.env.PORT;  // Server port from environment variables


// Initialize database connection
// This connects to MongoDB using the configuration in mongodbController.js
connectdb();

// Middleware Configuration
app.use(express.json());                         // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies with nested objects
app.use(cookieParser());                         // Parse Cookie header and populate req.cookies

// API Routes Configuration
// All routes are mounted under the /api path to create a versioned API structure
app.use('/api', adminRouter);
app.use('/api', commentRouter);
app.use('/api', postRouter);
app.use('/api', userRouter);

// Global error handling middleware
// This must be registered after all routes to catch any errors thrown in route handlers
app.use(errorHandler);

// Start the server and listen on the configured port
app.listen(port, () => {
console.log(`Server running on port ${port}`);
});