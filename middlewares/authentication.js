/**
* Authentication Middleware
* 
* Verifies JWT tokens from request cookies and loads the associated user.
* Uses the same JWT_SECRET environment variable as the token generator.
* Attaches the authenticated user to the request object for route handlers.
* 
* Token validity checks:
* 1. Confirms if token exists in cookies
* 2. Verifies token signature and expiration (via jwt.verify)
* 3. Confirms the user exists in the database
*/
const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const asyncHandler = require('./asyncHandler');

const authenticate = asyncHandler(async (request, response, next) => {
    if (!request.cookies?.token) {
        return response.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = request.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
        return response.status(401).json({ message: 'User not found' });
    }

    request.user = user;
    next();
});

module.exports = authenticate;