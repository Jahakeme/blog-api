const {Router} = require('express');
const postRouter = Router();

const { createPost, getAllPosts, getPostById, searchPosts, updatePost, deletePost } = require('../controllers/postController');
const authMiddleware = require('../middlewares/authentication');

postRouter.post('/posts', authMiddleware, createPost);

postRouter.get('/posts', getAllPosts);

postRouter.get('/posts/search', searchPosts);

postRouter.get('/posts/:id', getPostById);

postRouter.put('/posts/:id', authMiddleware, updatePost);

postRouter.delete('/posts/:id', authMiddleware, deletePost);

module.exports = postRouter;