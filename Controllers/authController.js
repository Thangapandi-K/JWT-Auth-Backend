//imports
import User from "../Models/userModel.js";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import transporter from "../config/nodemailer.js";

//registration controller
export const register = async (request, response) => {

    try {
        //getting details from request body
        const {name, email, password} = request.body;
        //check if all details provided
        if (!name || !email || !password) {
            return response.json({success: false, message: "Please Provide All Details.!!!"});
        };
        //checking if user alresdy exists
        const existingUser = await User.findOne({email});
        //if user already exists
        if(existingUser) {
            return response.status(400).json({success: false, message: "User Already Exists.!!!"});
        };
        //hasing the user password
        const hashedPassword = await bcrypt.hash(password, 10);
        //saving the user details with hashed password
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });
        //saving the new user
        await newUser.save();
        //generating new JWT token
        const token = JWT.sign(
            {id: newUser._id}, 
            process.env.JWT_SECRET_KEY,
            {expiresIn: '7d'}
        );
        //sending the JWT Token in cookies
        response.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        //mail body to user
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome To Mern-Auth",
            text: `Welcome to Mern-auth ${name}. Your account has been created with email id: ${email}`
        };
        //sending mail to the user mail id
        await transporter.sendMail(mailOptions);
        //on successfull execution
        return response.status(200).json({success: true, message: 'User Registered Successfully !!!'});
        //incase of error
    } catch (error) {
        return response.status(500).json({success: false, message: error.message});
    };
};

//login controller
export const login = async (request, response) => {

    try {
        //getting details from request body
        const {email, password} = request.body;
        //check if all details provided
        if (!email || !password) {
            return response.status(400).json({success: false, message: "Please Provide All Details.!!!"});
        };
        //check if the user already exists
        const user = await User.findOne({email});
        //if user not exists 
        if(!user) {
            return response.status(404).json({success: false, message: "User Not Registered.!!!"});
        };
        //checking the user password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        //if password not matches
        if(!isPasswordMatch) {
            return response.status(401).json({success: false, message: "Password Incorrect.!!!"});
        };
        //generating new JWT token
        const token = JWT.sign(
            {id: user._id}, 
            process.env.JWT_SECRET_KEY,
            {expiresIn: '7d'}
        );
        //sending the JWT Token in cookies
        response.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        //on successfull execution
        return response.status(200).json({success: true, message: 'User Logged In Successfully !!!'});
        //incase of error
    } catch (error) {
        return response.status(500).json({success: false, message: error.message});
    };
};

//logout controller
export const logout = async (request, response) => {
    try {
        //clearing the cookie
        response.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        });
        //on successfull execution
        return response.status(200).json({success: true, message: 'User Logged Out Successfully !!!'});
        //incase of error
    } catch (error) {
        return response.status(500).json({success: false, message: error.message});
    };
};

//send Verification Otp to user's email id
export const sendVerifyOtp = async(request, response) => {
    try {
        //getting details from request body
        const {userId} = request.body;
        //getting user details using user id
        const user = await User.findById(userId);
        //check if the user account is verified
        if(user.isAccountVerified) {
            return response.json({success: false, message: "Account Already Verified !!!"});
        };
        //if account not verified create otp and send to user email
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        //saving otp and otp lifetime in user's data
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        //saving the details in database
        await user.save(); 
        //otp mail body
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Account Verification OTP",
            text: `Your OTP for verification is ${otp}`
        };
        //sending mail to the user mail id
        await transporter.sendMail(mailOptions);
        //on successfull execution
        return response.status(200).json({success: true, message: "Verification OTP sent to Registered Email Id !!!"});
        //incase of error
    } catch (error) {
        return response.status(500).json({success: false, message: error.message});
    };
};

//verifying the email using otp
export const verifyEmail = async(request, response) => {

    try {
        //getting details from request body
        const {userId, otp} = request.body;
        //check if all details provided
        if(!userId || !otp) {
            return response.json({success: false, message: "Missing Details !!!"});
        };
        //getting user details using user id
        const user = await User.findById(userId);
        //if user not exists
        if(!user) {
            return response.status(404).json({success: false, message: "User Not Found !!!"});
        };
        //if otp not provided or mismatch
        if(user.verifyOtp === '' || user.verifyOtp !== otp) {
            return response.status(404).json({success: false, message: "Invalid OTP !!!"});
        };
        //if otp expired
        if(user.verifyOtpExpireAt < Date.now()) {
            return response.json({sucess: false, message: "OTP Expired !!!"});
        };
        //adding details to user data
        user.isAccountVerified = true;
        user.verifyOtp = "";
        user.   verifyOtpExpireAt = 0;
        //saving the updated user 
        await user.save();
        //on successfull execution
        return response.status(200).json({success: true, message: "Email Verified successfully !!!"});
        //incase of error
    } catch (error) {
        return response.status(500).json({success: false, message: error.message});
    };
};

//to check is the user authenticated
export const isAuthenticated = async(request, response) => {
    try {
        //on successfull execution
        return response.json({success: true, message: 'Authenticated !!!'});
        //incase of error
    } catch (error) {
        return response.status(500).json({success: false, message: error.message});
    };
};

//send mail to reset otp
export const passwordResetOtp = async(request, response) => {
    
    try {
        //getting details from request body
        const {email} = request.body;
        //if email not provided
        if(!email) {
            return response.json({success: false, message: "Email Id Required !!!"});
        };
        //getting user details using email
        const user = await User.findOne({email});
        //if user not exists
        if(!user) {
            return response.status(404).json({success: false, message: `User Not Found !!!`});
        };
        //creating a otp
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        //saving the otp and otp lifetime to user data
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        //saving the updated user details
        await user.save();
        //mail body to send otp
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Password Reset OTP",
            text: `Your Password Reset OTP is ${otp}`
        };
        //sending email to user's email id
        await transporter.sendMail(mailOptions);
        //on successfull execution
        return response.status(200).json({success: true, message: 'OTP sent to your Email Id !!!'});
        //incase of error
    } catch (error) {
        return response.status(500).json({success: false, message: error.message});
    };
};

//verify otp and reset password
export const resetPassword = async(request, response) => {

    try {
        //getting details from request body
        const {email, otp, newPassword} = request.body;
        //check if all details are provided
        if(!email || !otp || !newPassword) {
            return response.json({success: false, message: 'Email, OTP and New Password are required !!!'});
        };
        //getting user details using email
        const user = await User.findOne({email});
        //if user not exists
        if(!user) {
            return response.status(404).json({success: false, message: "User Not Found !!!"});
        };
        //if otp not provided or mismatch
        if(user.resetOtp === "" || user.resetOtp !== otp) {
            return response.json({success: false, message: "Invalid OTP !!!"});
        };
        //if otp expired
        if(user.resetOtpExpireAt < Date.now()) {
            return response.json({success: false, message: "OTP Expired !!!"});
        };
        //hasing the user password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        //updating the new password
        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpireAt = 0;
        //saving the updated user data
        await user.save(); 
        //on successfull execution
        return response.status(200).json({success: true, message: "Password  has been reset successfully !!!"});
        //incase of error
    } catch (error) {
        return response.status(500).json({success: false, message: error.message});
    };
};