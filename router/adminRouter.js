const {Router} = require('express');
const adminRouter = Router();

const { deletePostAsAdmin, deleteCommentAsAdmin, getUsers, getUserById } = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authentication');
const { isAdmin } = require('../middlewares/admin');


adminRouter.delete('/admin/posts/:id', authMiddleware, isAdmin, deletePostAsAdmin);

adminRouter.delete('/admin/comments/:id', authMiddleware, isAdmin, deleteCommentAsAdmin);

adminRouter.get('/admin/users', authMiddleware, isAdmin, getUsers);

adminRouter.get('/admin/users/:id', authMiddleware, isAdmin, getUserById);

module.exports = adminRouter;