const {Router} = require('express');
const userRouter = Router();

const { registerUser, loginUser, getUserById, updateUser, deleteUser, logoutUser } = require('../controllers/userController');
const authMiddlware = require('../middlewares/authentication');

userRouter.post('/users/signup', registerUser);

userRouter.post('/users/login', loginUser);

userRouter.get('/users/:id', authMiddlware, getUserById);

userRouter.put('/users/:id', authMiddlware, updateUser);

userRouter.delete('/users/:id', authMiddlware, deleteUser);

userRouter.post('/users/logout', logoutUser);

module.exports = userRouter;