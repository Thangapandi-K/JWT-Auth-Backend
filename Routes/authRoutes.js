//imports
import express from 'express';
import { isAuthenticated, login, logout, passwordResetOtp, register, resetPassword, sendVerifyOtp, verifyEmail} from '../Controllers/authController.js';
import userAuth from '../Middlewares/userAuth.js';
//creating express router
const authRouter = express.Router();
//routes
authRouter.post('/register', register)
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-email', userAuth, verifyEmail);
authRouter.get('/isAuth', userAuth, isAuthenticated);
authRouter.post('/send-reset-otp', passwordResetOtp);
authRouter.post('/reset-password', resetPassword);
//exports
export default authRouter;