import express from 'express';
import { isAuth, login, logout, register } from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';

const userRouter = express.Router();

userRouter.post('/register', register);
userRouter.post('/login', login);

// Check Auth Status (GET is fine here)
userRouter.get('/is-auth', authUser, isAuth);

// Logout Safe Mode: POST
userRouter.post('/logout', authUser, logout);

export default userRouter;