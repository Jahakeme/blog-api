const Post = require('../models/postModel');
const asyncHandler = require('../middlewares/asyncHandler');

/** 
 * @desc    Create a post
 * @route   POST /api/posts
 * @access  Private
 */ 
const createPost = asyncHandler(async (request, response) => {
    const { title, content } = request.body;

    // Validate required fields
    if (!title || !content) {
        return response.status(400).json({ message: 'Title and content are required' });
    }

    // Set the author from the authenticated user
    const author = request.user._id;

    // Create the post
    const post = await Post.create({
        title,
        content,
        author
    });

    if (post) {
        response.status(201).json(post);
    } else {
        response.status(400).json({ message: 'Invalid post data' });
    }
});

/**
 * @desc    Get all posts
 * @route   GET /api/posts
 * @access  Public
 */
const getAllPosts = asyncHandler(async (_, response) => {
    const posts = await Post.find({}).populate('author', 'username');
    response.status(200).json(posts);
});

/**
 * @desc    Get post by ID
 * @route   GET /api/posts/:id
 * @access  Public
 */
const getPostById = asyncHandler(async (request, response) => {
    const post = await Post.findById(request.params.id).populate('author', 'username');

    if (post) {
        // Increment the read count
        post.reads += 1;
        await post.save();
        
        response.status(200).json(post);
    } else {
        response.status(404);
        throw new Error('Post not found');
    }
});

/**
 * @desc    Search posts by title and content
 * @route   GET /api/posts/search
 * @access  Public
 * @query   {string} keyword - Search keyword for title and content
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Results per page (default: 10)
 * @query   {string} sortBy - Field to sort by (default: createdAt)
 * @query   {string} order - Sort order (asc or desc, default: desc)
 */
const searchPosts = asyncHandler(async (request, response) => {
    // Query parameters
    const keyword = request.query.keyword || '';
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;
    const sortBy = request.query.sortBy || 'createdAt';
    const order = request.query.order === 'asc' ? 1 : -1;
    
    // Validate pagination parameters
    if (page < 1 || limit < 1) {
        return response.status(400).json({ message: 'Invalid page or limit number' });
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Create regex pattern for case-insensitive search
    const regex = new RegExp(keyword, 'i');
    
    // Create query filter for title OR content
    const filter = {
        $or: [
            { title: { $regex: regex } },
            { content: { $regex: regex } }
        ]
    };
    
    // Create sort object
    const sort = {};
    sort[sortBy] = order;
    
    // Execute count query for total results
    const totalPosts = await Post.countDocuments(filter);
    
    // Execute find query with pagination, sorting, and populate
    const posts = await Post.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('author', 'username');
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalPosts / limit);
    
    response.status(200).json({
        posts,
        pagination: {
            total: totalPosts,
            page,
            limit,
            pages: totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    });
});

/**
 * @desc    Update a post
 * @route   PUT /api/posts/:id
 * @access  Private
 */
const updatePost = asyncHandler(async (request, response) => {
    const { title, content } = request.body;

    // Find the post by ID
    const post = await Post.findById(request.params.id);

    if (!post) {
        response.status(404);
        throw new Error('Post not found');
    }

    // Check if the authenticated user is the author of the post
    if (post.author.toString() !== request.user._id.toString()) {
        response.status(403);
        throw new Error('You are not authorized to update this post');
    }

    // Update the post fields
    post.title = title || post.title;
    post.content = content || post.content;

    // Save the updated post
    const updatedPost = await post.save();
    response.status(200).json(updatedPost);
});

/**
 * @desc    Delete a post
 * @route   DELETE /api/posts/:id
 * @access  Private
 */
const deletePost = asyncHandler(async (request, response) => {
    const post = await Post.findById(request.params.id);
    const { confirmation } = request.body;

    // Require explicit confirmation
    if (!confirmation || confirmation !== 'DELETE') {
        return response.status(400).json({ 
            message: 'Please confirm deletion by providing the confirmation field with value DELETE' 
        });
    }

    // Check if the post exists
    if (!post) {
        response.status(404);
        throw new Error('Post not found');
    }

    // Check if the authenticated user is the author of the post
    if (post.author.toString() !== request.user._id.toString()) {
        response.status(403);
        throw new Error('You are not authorized to delete this post');
    }

    // Delete the post
    await Post.deleteOne({ _id: request.params.id });
    response.status(200).json({ message: 'Post removed' });
});

module.exports = { createPost, getAllPosts, getPostById, searchPosts, updatePost, deletePost };
