/**
 * JWT Token Generation Utility
 * 
 * This module provides a function to generate secure JWT tokens for user authentication.
 * It uses environment variables for configuration:
 * - JWT_SECRET: The secret key used to sign the token
 * - JWT_EXPIRE: The token expiration time (e.g., "1h", "7d", "30d")
 */
const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token for a user
 * 
 * @param {string|number} id - The user ID to encode in the token
 * @returns {string} The signed JWT token
 */
const generateToken = (id) => {
    try{
        return jwt.sign({id}, 
        process.env.JWT_SECRET, 
        {
        expiresIn: process.env.JWT_EXPIRE
        }
    );
    } catch (error) {
        console.error('Token generation failed:', error);
    }
};

module.exports = generateToken;