import { User } from "../models/user.models.js";
import { ProjectMember } from "../models/projectmember.model.js";
import { APIError } from "../Utils/API-error.js";
import asyncHandler from "../Utils/async-handler.js";
import jwt, { decode } from "jsonwebtoken"
import mongoose from "mongoose";

export const VerifyJWT=asyncHandler (async(req,res,next)=>{
    const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

    if(!token){
        throw new APIError(401,"Unautorization error",[]);
    }

    try {
        const decoded_token=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded_token?._id).select(
            "-password -refreshToken -EmailVerificationToken -EmailVerificationExpiry"
        )
        if(!user){
            throw new APIError(401,"Invalid Token",[])
        }
        req.user=user;
        next();
    } catch (error) {
        throw new APIError(401,"Invalid Token",[])   
    }

})

export const ValidateProjectPermission=(roles=[])=>{
   return asyncHandler(async(req,res,next)=>{
        const {projectId}=req.params
        if(!projectId){
            throw new APIError(404,"Project Id not found",[]);
        }
        const project=await ProjectMember.findOne({
            project:new mongoose.Types.ObjectId(projectId),
            user:new mongoose.Types.ObjectId(req.user._id)
        })
        
        if(!project){
            throw new APIError(404,"Project not found",[])
        }

        const givenRole=project?.role

        req.user.role=givenRole
        
        if(!roles.includes(givenRole)){
            throw new APIError(400,"your not allowed to do certain changes in the project",[]);
        }

        next()

    })
}
