import mongoose, { Schema } from "mongoose";

const ProjectSchema=Schema(
   {
       name:{
        type:String,
        trim:true,
        required:true,
        unique:true
        },
        description:{
            type:String,

        },
        CreatedBy:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        }
    },
    {timestamps:true}
)

export const Project=mongoose.model("Project",ProjectSchema);