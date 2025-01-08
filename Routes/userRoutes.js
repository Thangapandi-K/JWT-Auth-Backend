//imports
import express from 'express';
import { getUserData } from '../Controllers/userController.js';
import userAuth from '../Middlewares/userAuth.js';
//creating express router
const userRouter = express.Router();
//routes
userRouter.get('/data', userAuth, getUserData);
//exports
export default userRouter;