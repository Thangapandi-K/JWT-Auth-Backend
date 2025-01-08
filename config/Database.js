//imports
import mongoose from "mongoose";

//connecting to MongoDB
const ConnectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Database connected...');
    } catch (error) {
        console.log(error.message);
    };
};

//exports
export default ConnectDB;