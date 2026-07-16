import {User} from "../models/user.models.js"
import {Project} from "../models/project.models.js"
import {ProjectMember} from "../models/projectmember.model.js"
import {APIResponse} from "../utils/Api-response.js"
import asyncHandler from "../Utils/async-handler.js";
import {APIError} from "../Utils/API-error.js"
import mongoose from "mongoose";
import { AvailableUserRoles, UserRolesENUM } from "../Utils/constants.js";


const getProject=asyncHandler(async(req,res)=>{
    const project=await ProjectMember.aggregate([
        {
            $match:{
                user:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"projects",
                localField:"projects",
                foreignField:"_id",
                as:"projects",
                pipeline:[
                    {
                        $lookup:{
                            from:"projectmembers",
                            localField:"_id",
                            foreignField:"projects",
                            as:"projectmembers"
                        }
                    },
                    {
                        $addFields:{
                            members:{
                                $size:"$projectmembers"
                            }
                        }
                    }
                ]
            }
        },
        {
            $unwind:"$projects"
        },
        {
            $project:{
                projects:{
                    _id:1,
                    name:1,
                    description:1,
                    members:1,
                    CreatedAt:1,
                    CreatedBy:1,
                },
                role:1,
                _id:0
            }
        }
    ])
    return res.status(200).json(
        new APIResponse(200,project,"Project Created Successfully")
    )
})

const getProjectById=asyncHandler(async(req,res)=>{
    const {ProjectId}=req.params
    const project=await Project.findById(ProjectId);
    if(!project){
        throw new APIError(404,"Project not found",[]);
    }
    return res.status(200).json(
        new APIResponse(200,project,"Project Found Successfully")
    )
})


const CreateProject=asyncHandler(async(req,res)=>{
    const {name,description}=req.body;
    const project=await Project.create({
        name,
        description,
        createdBy:new mongoose.Types.ObjectId(req.user._id)
    }) 

    await ProjectMember.create({
        user:new mongoose.Types.ObjectId(req.user._id),
        project:new mongoose.Types.ObjectId(project._id),
        role:UserRolesENUM.ADMIN
    })

    return res.status(201).json(
        new APIResponse(
            201,
            project,
            "Project is created Successfully"
        )
    )
    
})

const UpdateProject=asyncHandler(async(req,res)=>{
    const {name,description}=req.body
    const {projectId}=req.params

    const project=await Project.findByIdAndUpdate(
        projectId,
        {
            name,
            description
        },
        {new:true}
    )

    if(!project){
        throw new APIError(404,"Project not Found",[]);
    }

    return res.status(201).json(
        new APIResponse(
            201,
            project,
            "Project Updated Successfully"
        )
    )

})

const DeleteProject=asyncHandler(async(req,res)=>{
    const {projectID}=req.params;
    const project=await Project.findByIdAndDelete(projectID);
    if(!project){
        throw new APIError(404,"Project not found",[]);
    }
    return res.status(200).json(
        new APIResponse(200,project,"Project deleted Successfully")
    )
})

const addMembersToProject=asyncHandler(async(req,res)=>{
    const {email,username,role}=req.body
    const {ProjectId}=req.params

    const user=await User.findOne({email,username})
    if(!user){
        throw new APIError(404,"user not found")
    }
    const project=await ProjectMember.findByIdAndUpdate(
        {
            user:new mongoose.Types.ObjectId(user._id),
            project:new mongoose.Types.ObjectId(ProjectId)
        },
        {
            user:new mongoose.Types.ObjectId(user._id),
            project:new mongoose.Types.ObjectId(ProjectId),
            role:role
        },
        {
            new:true,
            upsert:true
        }
    )

    return res.status(200).json(
        new APIResponse(200,{},"Member added Succefully")
    )

})

const GetProjectMembers=asyncHandler(async(req,res)=>{
    const {ProjectId}=req.params
    const project=await Project.findById(ProjectId);

    if(!project){
        throw new APIError(404,"Projet not found",[]);
    }
    const projectMember=await ProjectMember.aggregate([
        {
            $match:{
                project:new mongoose.Types.ObjectId(ProjectId)
            },
        },
        {
            $lookup:{
                from:"users",
                localField:"user",
                foreignField:"_id",
                as:'user',
                pipeline:[
                    {
                        $project:{
                            _id:1,
                            username:1,
                            fullname:1,
                            avatar:1,
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                user:{
                    $arrayElemAt:["$user",0]
                }
            }
        },
        {
            $project:{
                project:1,
                user:1,
                role:1,
                CreatedAt:1,
                updatedAt:1,
                _id:0
            }
        }
    ])

    return res.status(200).json(
        new APIResponse(200,projectMember,"Project Members Fetched")
    )
})

const updateMemberRole=asyncHandler(async(req,res)=>{
    const {ProjectId,userId}=req.params
    const {newRole}=req.body

    if(!AvailableUserRoles.includes(newRole)){
        throw new APIError(400,"Invalid role",[]);
    }

    let ProjectMember=await ProjectMember.findOne({
        project:new mongoose.Types.ObjectId(ProjectId),
        user:new mongoose.Types.ObjectId(userId)
    })

    if(!projectMember){
        throw new APIError(404,"Member not Found",[]);
    }

    ProjectMember=await ProjectMember.findByIdAndUpdate(
        ProjectMember._id,
        {
            role:newRole
        },
        {
            new:true
        }
    )

    if(!projectMember){
        throw new APIError(404,"Member not Found",[]);
    }

    return res.status(200).json(
        new APIResponse(200,projectMember,"Project Role updated")
    )

})

const DeleteMember=asyncHandler(async(req,res)=>{
    const {ProjectId,userId}=req.params

    let ProjectMember=await ProjectMember.findOne({
        project:new mongoose.Types.ObjectId(ProjectId),
        user:new mongoose.Types.ObjectId(userId)
    })

    if(!projectMember){
        throw new APIError(404,"Member not Found",[]);
    }

    ProjectMember=await ProjectMember.findByIdAndDelete(
        ProjectMember._id,
    )

    if(!projectMember){
        throw new APIError(404,"Member not Found",[]);
    }

    return res.status(200).json(
        new APIResponse(200,projectMember,"Project Role updated")
    )
})


export {
    CreateProject,
    UpdateProject,
    DeleteProject,
    getProject, 
    getProjectById,
    addMembersToProject,
    GetProjectMembers,
    updateMemberRole,
    DeleteMember
}
