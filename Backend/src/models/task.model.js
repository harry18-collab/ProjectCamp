import mongoose, { Schema } from "mongoose";
import {
    AvailableTaskStatues,
    TaskRolesENUM
} from "../Utils/constants.js";

const TaskSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        AssignTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        AssignBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: AvailableTaskStatues,
            default: TaskRolesENUM.IN_PROGRESS
        },

        attachments: {
            type: [
                {
                    url: String,
                    mimetype: String,
                    size: Number
                }
            ],
            default: []
        }
    },
    {
        timestamps: true
    }
);

export const Task = mongoose.model("Task", TaskSchema);