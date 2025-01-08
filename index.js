//imports
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import ConnectDB from './config/Database.js';
import authRouter from './Routes/authRoutes.js';
import requestLogger from './Middlewares/requestLogger.js';
import userRouter from './Routes/userRoutes.js';
//creating express app
const app = express();
//connecting database
ConnectDB();
//declaring cors allowed origins
const allowedOrigins = [
    'http://localhost:5174', 
    'https://mern-auth-demo.netlify.app',
    'https://jwt-auth-frontend-gray.vercel.app/'
    ] 


//getting port from .env file
const PORT = process.env.PORT;
//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins ,credentials: true}));
app.use(requestLogger);
//API testing Endpoint
app.get('/', (request, response) => {
    try {
        response.send("Hello World !!!");
    } catch (error) {
        response.send(error.message);
    };
});
//routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter)
//creating server
app.listen(PORT, () => {
    try {
        console.log(`Server Connected on http://localhost:${PORT}`);
    } catch (error) {
        console.log(error.message);
    }
});