import { User } from "../models/user.models.js";
import { APIError } from "../Utils/API-error.js";
import asyncHandler from "../Utils/async-handler.js";
import jwt, { decode } from "jsonwebtoken"

export const VerifyJWT=asyncHandler (async(req,res,next)=>{
    const token=req.cookies?.accessToken || req.header("Authorization").replace("Bearer ","")

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
