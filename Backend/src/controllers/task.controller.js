import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { Task } from "../models/task.model.js";
import { SubTask } from "../models/subtask.model.js";
import { APIResponse } from "../utils/Api-response.js";
import asyncHandler from "../Utils/async-handler.js";
import { APIError } from "../Utils/API-error.js";
import mongoose from "mongoose";
import {
    AvailableUserRoles,
    UserRolesENUM
} from "../Utils/constants.js";



const getTask = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
        throw new APIError(404, "Project Not found", []);
    }

    const tasks = await Task.find({
        project: new mongoose.Types.ObjectId(projectId),
    }).populate("AssignTo", "avatar username fullname");

    return res.status(200).json(
        new APIResponse(
            200,
            tasks,
            "Tasks fetched successfully"
        )
    );
});



const UpdateTask = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const {TaskId}=req.params;

    const task=await Task.findByIdAndUpdate(
        TaskId,
        {
            title,
            description
        },
        {new:true}
    )
    if(!task){
        throw new APIError(404,"task not found",[])
    }
    return res.status(200).json(
        new APIResponse(200,task,"Task Updated Successfully")
    )
});


const DeleteTask = asyncHandler(async (req, res) => {
    
    const {taskId}=req.params;
    const task=await Task.findByIdAndDelete(taskId)
    
    if(!task){
        throw new APIError(404,"Task not Found",[])
    }

    await SubTask.deleteMany({
        task: new mongoose.Types.ObjectId(taskId)
    });


    return res.status(200).json(
        new APIResponse(200,task,"Task Deleted Successfully")
    )
});



const getTaskById = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    const task = await Task.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(taskId)
            }
        },

        // Get assigned user
        {
            $lookup: {
                from: "users",
                localField: "AssignTo",
                foreignField: "_id",
                as: "AssignTo",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            avatar: 1,
                            fullname: 1
                        }
                    }
                ]
            }
        },

        // Get subtasks
        {
            $lookup: {
                from: "subtasks",
                localField: "_id",
                foreignField: "task",
                as: "subTask",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "CreatedBy",
                            foreignField: "_id",
                            as: "CreatedBy",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        username: 1,
                                        fullname: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            CreatedBy: {
                                $arrayElemAt: ["$CreatedBy", 0]
                            }
                        }
                    }
                ]
            }
        },

        // Convert AssignTo array to object
        {
            $addFields: {
                AssignTo: {
                    $arrayElemAt: ["$AssignTo", 0]
                }
            }
        }
    ]);

    if (!task || task.length === 0) {
        throw new APIError(404, "Task not found", []);
    }

    return res.status(200).json(
        new APIResponse(
            200,
            task[0],
            "Task fetched successfully"
        )
    );
});



const CreateTask = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        assignedTo,
        status
    } = req.body;

    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
        throw new APIError(404, "Project not found", []);
    }

    const files = req.files || [];

    const attachments = files.map((file) => {
        return {
            url: `${process.env.SERVER_URL}/images/${file.originalname}`,
            mimetype: file.mimetype,
            size: file.size
        };
    });

    const task = await Task.create({
        title,
        description,
        project: new mongoose.Types.ObjectId(projectId),

        AssignTo: assignedTo
            ? new mongoose.Types.ObjectId(assignedTo)
            : undefined,

        status,

        AssignedBy: new mongoose.Types.ObjectId(req.user._id),

        attachments
    });

    return res.status(201).json(
        new APIResponse(
            201,
            task,
            "Task Created Successfully"
        )
    );
});



const CreateSubTask = asyncHandler(async (req, res) => {
    const {title,status}=req.body
    const {taskId}=req.params;

    const task=await Task.findById(taskId)
    if(!task){
        throw new APIError(404,"Task Not Found")
    }

    const subTask=await SubTask.create({
        title,
        task:new mongoose.Types.ObjectId(taskId),
        status,
        CreatedBy:new mongoose.Types.ObjectId(req.user._id)
    })

    return res.status(200).json(
        new APIResponse(200,subTask,"subTask Created Successfully")
    )

});



const UpdateSubTask = asyncHandler(async (req, res) => {
    const {title}=req.body;
    const {SubTaskId}=req.params;
    const subTask=await SubTask.findByIdAndUpdate(
        SubTaskId,
        {
            title
        },
        {new:true}
    )

    if(!subTask){
        throw new APIError(404,"SubTask not Found",[]);
    }

    return res.status(200).json(
        new APIResponse(200,SubTask,"SubTask Updated Successfully")
    )

});



const DeleteSubTask = asyncHandler(async (req, res) => {
    const {SubTaskId}=req.params

    const subTask=await SubTask.findByIdAndDelete(SubTaskId)
    if(!subTask){
        throw new APIError(404,"SubTask not found",[])
    }
    return res.status(200).json(
        new APIResponse(200,subTask,"SubTask Deleted Successfully")
    )

});


export {
    getTask,
    getTaskById,
    UpdateTask,
    DeleteTask,
    CreateTask,
    CreateSubTask,
    DeleteSubTask,
    UpdateSubTask,
};