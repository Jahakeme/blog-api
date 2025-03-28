const Comment = require('../models/commentModel');
const asyncHandler = require('../middlewares/asyncHandler');
const Post = require('../models/postModel'); // Ensure you import the Post model
const User = require('../models/userModel'); // Ensure you import the User model

/**
 * @desc    Create a new comment
 * @route   POST /api/comments
 * @access  Private
 */
const createComment = asyncHandler(async (request, response) => {
  const { content, post } = request.body;
  
  if (!content || !post) {
    response.status(400);
    throw new Error('Please provide content and post ID');
  }
  
  const comment = await Comment.create({
    content,
    author: request.user._id, 
    post
  });
  
  const populatedComment = await Comment.findById(comment._id)
    .populate('author', 'username')
    .populate('post', 'title');
  
  response.status(201).json(populatedComment);
});

/**
 * @desc    Get all comments
 * @route   GET /api/comments
 * @access  Public
 */
const getAllComments = asyncHandler(async (_, response) => {
  const comments = await Comment.find({})
    .populate('author', 'name email')
    .populate('post', 'title');
  
  response.status(200).json(comments);
});

/**
 * @desc    Get comment by ID
 * @route   GET /api/comments/:id
 * @access  Public
 */
const getCommentById = asyncHandler(async (request, response) => {
  const comment = await Comment.findById(request.params.id)
    .populate('author', 'username')
    .populate('post', 'title content');
  
  if (!comment) {
    response.status(404);
    throw new Error('Comment not found');
  }
  
  response.status(200).json(comment);
});

/**
 * @desc    Update a comment
 * @route   PUT /api/comments/:id
 * @access  Private
 */
const updateComment = asyncHandler(async (request, response) => {
  const { content } = request.body;
  
  const comment = await Comment.findById(request.params.id);
  
  if (!comment) {
    response.status(404);
    throw new Error('Comment not found');
  }
  
  // Check if the user is the author of the comment (authorization)
  if (comment.author.toString() !== request.user._id.toString()) {
    response.status(403);
    throw new Error('You are not authorized to update this comment');
  }
  
  comment.content = content || comment.content;
  
  const updatedComment = await comment.save();
  
  const populatedComment = await Comment.findById(updatedComment._id)
    .populate('author', 'username')
    .populate('post', 'title');
  
  response.status(200).json(populatedComment);
});

/**
 * @desc    Delete a comment
 * @route   DELETE /api/comments/:id
 * @access  Private
 */
const deleteComment = asyncHandler(async (request, response) => {
  // Validate the user from the database
  const user = await User.findById(request.user._id);
  if (!user) {
    response.status(401);
    throw new Error('Invalid user');
  }

  const comment = await Comment.findById(request.params.id);
  if (!comment) {
    response.status(404);
    throw new Error('Resource not found');
  }

  // Fetch the post associated with the comment
  const post = await Post.findById(comment.post);
  if (!post) {
    response.status(404);
    throw new Error('Resource not found');
  }

  // Check if the user is either the author of the comment or the owner of the post
  if (
    comment.author.toString() !== request.user._id.toString() &&
    post.author.toString() !== request.user._id.toString()
  ) {
    console.log(`Unauthorized deletion attempt by user ${request.user._id}`);
    response.status(403);
    throw new Error('You are not authorized to delete this comment');
  }

  await comment.deleteOne();

  console.log(`Comment ${comment._id} deleted by user ${request.user._id}`);
  response.status(200).json({ message: 'Comment deleted successfully' });
});

module.exports = { createComment, getAllComments, getCommentById, updateComment, deleteComment };