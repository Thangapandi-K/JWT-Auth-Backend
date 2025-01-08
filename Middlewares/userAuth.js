//imports
import JWT from 'jsonwebtoken';
//middleware to check the user authentication
const userAuth = async(request, response, next) => {

    try {
        //getting token details from cookies
        const {token} = request.cookies;
        //if no token exists
        if(!token) {
            return response.json({success: false, message: "Not Authorized, Please Login !!!"});
        };
        //decoding the user id from the token received
        const decodedToken = JWT.verify(token, process.env.JWT_SECRET_KEY);

        if(decodedToken.id) {
            //passing userid with the request body
            request.body.userId = decodedToken.id
        } else {
            //incase of error
            return response.json({success: false, message: "Not Authorized, Please Login !!!"});
        };
        //moving to next route
        next();
        //incase of error
    } catch (error) {
        return response.status(500).json({success: false, message: error.message});
    };
};
//exports
export default userAuth;