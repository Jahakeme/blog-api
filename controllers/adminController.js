const Post = require('../models/postModel');
const Comment = require('../models/commentModel');
const asyncHandler = require('../middlewares/asyncHandler');
const User = require('../models/userModel'); // Import the User model

/**
 * Delete any post as admin regardless of authorship
 * @route DELETE /api/admin/posts/:id
 * @access Admin
 */
const deletePostAsAdmin = asyncHandler(async (request, response) => {
  const postId = request.params.id;

  // Ensure the user is an admin (redundant check for safety)
  if (!request.user || !request.user.role.includes('admin')) {
    return response.status(403).json({ message: 'You are not authorized to perform this action' });
  }

  // Find the post by ID
  const post = await Post.findById(postId);

  if (!post) {
    return response.status(404).json({ message: 'Post not found' });
  }

  // Delete all comments associated with the post
  await Comment.deleteMany({ post: postId });

  // Delete the post
  await post.deleteOne();

  response.status(200).json({
    success: true,
    message: 'Post and all associated comments deleted successfully by admin',
    deletedPost: {
      id: post._id,
      title: post.title,
      author: post.author,
    },
  });
});

/**
 * Delete any comment as admin regardless of authorship
 * @route DELETE /api/admin/comments/:id
 * @access Admin
 */
const deleteCommentAsAdmin = asyncHandler(async (request, response) => {
  const commentId = request.params.id;

  // Ensure the user is an admin (redundant check for safety)
  if (!request.user || !request.user.role.includes('admin')) {
    return response.status(403).json({ message: 'You are not authorized to perform this action' });
  }

  // Find the comment by ID
  const comment = await Comment.findById(commentId);

  if (!comment) {
    return response.status(404).json({ message: 'Comment not found' });
  }

  // Remove the comment reference from the associated post
  await Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: comment._id },
  });

  // Delete the comment
  await comment.deleteOne();

  response.status(200).json({
    success: true,
    message: 'Comment deleted successfully by admin',
    deletedComment: {
      id: comment._id,
      post: comment.post,
    },
  });
});

/**
 * Get all users
 * @route GET /api/admin/users
 * @access Admin
 */
const getUsers = asyncHandler(async (request, response) => {
  console.log('Authenticated User:', request.user);
  // Ensure the user is an admin (redundant check for safety)
  if (!request.user || !request.user.role.includes('admin')) {
    return response.status(403).json({ message: 'You are not authorized to perform this action' });
  }

  // Retrieve all users, excluding the password field
  const users = await User.find({}, '-password');

  response.status(200).json({
    success: true,
    users,
  });
});

/**
 * Get a user by ID
 * @route GET /api/admin/users/:id
 * @access Admin
 */
const getUserById = asyncHandler(async (request, response) => {
  const userId = request.params.id;

  // Ensure the user is an admin (redundant check for safety)
  if (!request.user || !request.user.role.includes('admin')) {
    return response.status(403).json({ message: 'You are not authorized to perform this action' });
  }

  const user = await User.findById(request.user._id);
  console.log('User Role:', user.role);
  console.log('Authenticated User:', request.user);

  // Find the user by ID, excluding the password field
  const userById = await User.findById(userId, '-password');

  if (!userById) {
    return response.status(404).json({ message: 'User not found' });
  }

  response.status(200).json({
    success: true,
    user: userById,
  });
});

module.exports = { deletePostAsAdmin, deleteCommentAsAdmin, getUsers,  getUserById };