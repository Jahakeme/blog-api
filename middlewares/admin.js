const asyncHandler = require('../middlewares/asyncHandler');
const User = require('../models/userModel');

/**
 * Get admin emails from environment variables
 * Format should be comma-separated list in .env: ADMIN_EMAILS=email1@example.com,email2@example.com
 */
const ADMIN_EMAILS = process.env.ADMIN_EMAILS 
  ? process.env.ADMIN_EMAILS.split(',').map(email => email.trim().toLowerCase())
  : [
      'jucalasitok@gmail.com', // Default admin if env variable is not set
      'marksimon@gmail.com'
    ];

/**
 * Check if a user's email is in the pre-defined admin list
 * @param {string} email - User email to check
 * @returns {boolean} - True if user is an admin
 */
const isPreDefinedAdmin = (email) => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

/**
 * Middleware to check if the user is an admin
 * This checks both the database role and pre-defined admin emails
 */
const isAdmin = asyncHandler(async (request, response, next) => {
    if (!request.user) {
      return response.status(401).json({ message: 'Not authenticated' });
    }

    // Validate the user against the database
    const user = await User.findById(request.user._id);
    if (!user) {
      return response.status(401).json({ message: 'User not found' });
    }
  
    // Check if user has admin role in database OR their email is in pre-defined list
    if (!user.role.includes('admin') && !isPreDefinedAdmin(user.email)) {
      return response.status(403).json({ message: 'Forbidden: Admin access required' });
    }
  
    next();
  });

  module.exports = { isPreDefinedAdmin, isAdmin } ;