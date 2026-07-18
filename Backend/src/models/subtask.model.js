import { Schema } from "mongoose";

const SubTaskSchema =new Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    Task:{
        type:Schema.Types.ObjectId,
        ref:"Task",
        required:true
    },
    isCompleted:{
        type:bool,
        default:false,
    },
    CreatedBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true}) 


export const SubTask=mongoose.model("SubTask","SubTaskSchema")