const {Router} = require('express');
const commentRouter = Router();

const { createComment, getAllComments, getCommentById, updateComment, deleteComment } = require('../controllers/commentController');
const authMiddleware = require('../middlewares/authentication');

commentRouter.post('/comments', authMiddleware, createComment);

commentRouter.get('/comments', getAllComments);

commentRouter.get('/comments/:id', getCommentById);

commentRouter.put('/comments/:id', authMiddleware, updateComment);

commentRouter.delete('/comments/:id', authMiddleware, deleteComment);

module.exports = commentRouter;