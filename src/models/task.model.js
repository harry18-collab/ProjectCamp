import mongoose, { Schema } from "mongoose";
import {AvailableTaskStatues,TaskRolesENUM} from "../Utils/constants.js"

const TaskSchema=new Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:String,
    AssignTo:{
        type:Schema.Types.ObjectId,
        required:true
    },
    AssignBy:{
        type:Schema.Types.ObjectId,
        required:true
    },
    status:{
        type:string,
        enum:AvailableTaskStatues,
        default:TaskRolesENUM.IN_PROGRESS
    },
    attachments:{
        type:[{
            url:String,
            mimetype:String,
            size:Number
        }],
        default:true
    }

},{timestamps:true})

export const Task=mongoose.model("Task","TaskSchema")