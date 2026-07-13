import { Schema } from "mongoose";
import {AvailableUserRoles,UserRolesENUM} from "../Utils/constants.js"

const ProjectMemberSchema=new Schema(
    {
        user:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        project:{
            type:Schema.Types.ObjectId,
            ref:"Project",
            required:true
        },
        role:{
            type:String,
            enum:AvailableUserRoles,
            default:UserRolesENUM.MEMBER
        },

    },
    {timestamps:true}
)

export const ProjectMember=moongose.models("ProjectMember",ProjectMemberSchema)