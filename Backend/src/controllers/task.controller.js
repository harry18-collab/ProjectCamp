import {User} from "../models/user.models.js"
import {Project} from "../models/project.models.js"
import {Task} from "../models/task.model.js"
import {SubTask} from "../models/subtask.model.js"
import {APIResponse} from "../utils/Api-response.js"
import asyncHandler from "../Utils/async-handler.js"
import {APIError} from "../Utils/API-error.js"
import mongoose from "mongoose";
import { AvailableUserRoles, UserRolesENUM } from "../Utils/constants.js"

const getTask=asyncHandler(async(req,res)=>{
    const {projectId}=req.params
    const project=await Project.findById(projectId)
    if(!project){
        throw new APIError(404,"Project Not found",[])
    }
    const tasks=await Task.find({
        project:new mongoose.Types.ObjectId(projectId),
    }).populate("AssignTo","avatar username fullname");
    
    return res.staus(200).json(
        new APIResponse(200,tasks,"Task fetch Successsfully")
    )
})

const UpdateTask=asyncHandler(async(req,res)=>{
    
})

const DeleteTask=asyncHandler(async(req,res)=>{
    
})

const getTaskById=asyncHandler(async(req,res)=>{
    
})

const CreateTask=asyncHandler(async(req,res)=>{
    const {title,description,assignedTo,status}=req.body
    const {projectId}=req.params;

    const project=await Project.findById(projectId)
    if(!project){
        throw new APIError(404,"Proejct not found",[])
    }

    const files=req.files || [];
    const attachments=files.map((file)=>{
        return {
            url:`${process.env.SERVER_URL}/images/${file.originalname}`,
            mimetype:file.mimetype,
            size:file.size
        }
    })

    const Task=await Task.Create({
        title,
        description,
        project:new mongoose.Types.ObjectId(projectId),
        AssignedTo:assignedTo?new mongoose.Types.ObjectId(assignedTo):undefined,
        status,
        AssignedBy:new mongoose.Types.ObjectId(req.user._id),
        attachments
    })

    return res.staus(200).json(
        new APIResponse(200,Task,"Task Created Successfully")
    )

})

const CreateSubTask=asyncHandler(async(req,res)=>{
    
})

const UpdateSubTask=asyncHandler(async(req,res)=>{
    
})

const DeleteSubTask=asyncHandler(async(req,res)=>{
    
})

export{
    getTask,
    getTaskById,
    UpdateTask,
    DeleteTask,
    CreateTask,
    CreateSubTask,
    DeleteSubTask,
    UpdateSubTask,
}