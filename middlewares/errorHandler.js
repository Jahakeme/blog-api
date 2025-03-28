/**
 * Error handling middleware
 * 
 * Catches errors in the application and returns a standardized JSON error response
 * with status code and error message. If the error doesn't specify a status code,
 * defaults to 500 (Internal Server Error).
 * 
 */
const errorHandler = (error, request, response, next) => {
    console.error(error.stack);

    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
        return response.status(401).json({ message: 'Token expired, please log in again' });
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({ message: 'Invalid token' });
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
        return response.status(400).json({ message: Object.values(error.errors).map(err => err.message).join(', ') });
    }

    // Handle Mongoose cast errors (e.g., invalid ObjectId)
    if (error.name === 'CastError') {
        return response.status(400).json({ message: `Invalid ${error.path}: ${error.value}` });
    }

    // General error handling
    const statusCode = response.statusCode === 200 ? 500 : response.statusCode;
    response.status(statusCode).json({
        message: error.message,
        stack: process.env.SHOW_STACK_TRACE === 'true' ? error.stack : null,
    });
};

module.exports = errorHandler;