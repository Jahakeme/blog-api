const User = require('../models/userModel.js'); // User model for user data operations
const Post = require('../models/postModel.js'); // Post model for post data operations
const Comment = require('../models/commentModel.js'); // Comment model for post data operations


// Security and authentication utilities
const bcrypt = require('bcryptjs');    // Password hashing library for secure storage
const generateToken = require('../jsonwebtoken/tokengenerator'); // JWT token generation
const asyncHandler = require('../middlewares/asyncHandler'); // Async error handling middleware
const { isPreDefinedAdmin } = require('../middlewares/admin');

const registerUser = asyncHandler(async (request, response) => {
    const { username, email, password } = request.body;

    // Validate required fields
    if (!username || !email || !password) {
        return response.status(400).json({message: 'Please provide all required fields' });
    }
    
    // Validate password length
    if (password && password.length < 8) {
        return response.status(400).json({message: 'Password must be at least 8 characters long'});
    }

    // Check for duplicate emails to ensure uniqueness
    const emailExists = await User.findOne({ email });
    if (emailExists) {
        return response.status(400).json({ message: 'User with this email already exists'});
    }

    // Security: Hash password using bcrypt before storage
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine the user's role
    const roles = isPreDefinedAdmin(email) ? ['admin', 'user'] : ['user'];

    // Create new user object with hashed password
    const user = await User.create({
        username,
        email,
        profile: {},
        password: hashedPassword,
        role: roles
    });
    await user.save();
    console.log(user);
    // Return success message based on the user's role
    if (roles.includes('admin')) {
        response.status(201).json({ message: 'User created successfully. You have been assigned both user and admin roles.' });
    } else {
        response.status(201).json({ message: 'User created successfully' });
    }
});

const loginUser = asyncHandler(async (request, response) => {
    // Get the email and password from the request body
    const { email, password } = request.body; 

    // Validate required fields
    // Security: Using generic error message to avoid revealing which field is missing
    if (!email || !password) {
        return response.status(400).json({message: 'Please provide all required fields' });
    }

    // Verify if user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
        return response.status(400).json({ message: 'User not found'});
    }

    // Verify password using bcrypt's secure comparison
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return response.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token for authenticated user
    const token = generateToken(user._id);

    // Remove password from user object before sending to client
    // Using object destructuring to create a new object without the password field
    const { password: _, ...userWithoutPassword } = user.toObject();

    // Store token in HTTP-only cookie to prevent XSS attacks
    response.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Ensures cookies are sent over HTTPS in production
        sameSite: 'strict',
        maxAge: 10800000 // 3 hour
    });

    // Return success without sending back user details for security
    response.status(200).json({message: 'Login successful'});
});

/**
 * Get a user by ID
 * @route GET /api/users/:id
 * @access Private
 */
const getUserById = asyncHandler(async (request, response) => {
    const userId = request.params.id;

    // Ensure the authenticated user is requesting their own data
    if (request.user._id.toString() !== userId) {
        return response.status(403).json({ message: 'You are not authorized to access this data' });
    }

    // Find the user by ID and exclude sensitive fields like password
    const user = await User.findById(userId, '-password');

    if (!user) {
        return response.status(404).json({ message: 'User not found' });
    }

    response.status(200).json({
        success: true,
        user,
    });
});

/**
 * @desc   Update a user by ID
 * @route  PUT /api/users/:id
 * @access Private
 * */
const updateUser = asyncHandler(async (request, response) => {
    const userId = request.user._id;
    const { username, email, password, currentPassword, profile } = request.body;

    // Find the user first to check if they exist
    const user = await User.findById(userId);

    if (!user) {
        return response.status(404).json({ message: 'User not found' });
    }

    // Whitelist of fields that can be updated
    const allowedUpdates = ['username', 'email', 'password', 'profile'];
    const updates = Object.keys(request.body);

    // Check for invalid fields in the request body
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        return response.status(400).json({ message: 'Invalid updates' });
    }

    // Update username if provided
    if (username) {
        if (typeof username !== 'string' || username.length < 3 || username.length > 50) {
            return response.status(400).json({ message: 'Invalid username' });
        }
        user.username = username;
    }

    // Update email if provided and not already in use
    if (email && email !== user.email) {
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return response.status(400).json({ message: 'Invalid email format' });
        }

        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return response.status(400).json({ message: 'Email already in use' });
        }

        user.email = email;
    }

    // Update password if provided
    if (password) {
        if (!currentPassword) {
            return response.status(400).json({ message: 'Current password is required to update password' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return response.status(401).json({ message: 'Current password is incorrect' });
        }

        if (password.length < 8) {
            return response.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
    }

    // Validate and update profile fields if provided
    if (profile) {
        const { country, city, phoneNumber, bio } = profile;

        if (country !== undefined) {
            if (typeof country !== 'string' || country.length > 56) {
                return response.status(400).json({ message: 'Invalid country' });
            }
            user.set('profile.country', country);
        }

        if (city !== undefined) {
            if (typeof city !== 'string' || city.length > 85) {
                return response.status(400).json({ message: 'Invalid city' });
            }
            user.set('profile.city', city);
        }

        if (phoneNumber !== undefined) {
            if (typeof phoneNumber !== 'string' || !/^\d{10,15}$/.test(phoneNumber)) {
                return response.status(400).json({ message: 'Invalid phone number' });
            }
            user.set('profile.phoneNumber', phoneNumber);
        }

        if (bio !== undefined) {
            if (typeof bio !== 'string' || bio.length > 500) {
                return response.status(400).json({ message: 'Invalid bio' });
            }
            user.set('profile.bio', bio);
        }
    }

    // Save the updated user
    const updatedUser = await user.save();

    response.status(200).json({ message: 'User updated successfully', user: updatedUser });
});

const deleteUser = asyncHandler(async(request, response) => {
    const userId = request.user._id;
    const { confirmation } = request.body;
    
    // Check if the authenticated user is authorized to delete this account
    // User can only delete their own account unless they're an admin
    const userToDelete = await User.findById(userId);
    
    if (!userToDelete) {
        return response.status(404).json({ message: 'User not found' });
    }
    
    // Require explicit confirmation
    if (!confirmation || confirmation !== 'DELETE') {
        return response.status(400).json({ 
            message: 'Please confirm deletion by providing the confirmation field with value DELETE' 
        });
    }
    
    // Cascading delete: Remove all posts by this user
    await Post.deleteMany({ author: userId });
    
    // Cascading delete: Remove all comments by this user
    await Comment.deleteMany({ author: userId });
    
    // Delete user record after all associated data is removed
    await User.findByIdAndDelete(userId);
    
    // Clear authentication token cookie
    response.clearCookie('token', {
        httpOnly: true,
        secure: true
    });
    
    response.status(200).json({ message: 'User and all associated data deleted successfully' });
});

const logoutUser = asyncHandler(async(request, response) => {
    // Check if a valid JWT token is present in the request cookies
    const token = request.cookies?.token;
    if (!token) {
    return response.status(400).json({ message: 'No active session to log out from' });
}
    // Clear the authentication token cookie
    response.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    });
    
    // Return success message
    response.status(200).json({ message: 'Logged out successfully' });
});

module.exports = { registerUser, loginUser, getUserById, updateUser, deleteUser, logoutUser };