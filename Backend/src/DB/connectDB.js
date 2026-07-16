import mongoose from "mongoose";

const connectDB=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("mongoose connection successfull")
    } catch (error) {
        console.error("mongoose connection failed",error)
        process.exit(1);
    }
}

export default connectDB
