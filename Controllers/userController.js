//imports
import User from "../Models/userModel.js";

//getting user data
export const getUserData = async(request, response) => {
    try {
        //getting details from request body
        const {userId} = request.body;
        //getting user details using user id
        const user = await User.findById(userId);
        //if user not exists
        if(!user) {
            return response.json({success: false, message: "User Not Found !!!"});
        };
        //on successfull execution
        response.status(200).json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified,
            }
        });
        //incase of error
    } catch (error) {
        response.status(500).json({success: false, message: error.message});
    };
};