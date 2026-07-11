import {User} from "../models/user.models.js"
import {APIResponse} from "../utils/Api-response.js"
import asyncHandler from "../Utils/async-handler.js";
import {APIError} from "../Utils/API-error.js"
import {EmailVerificationMailgenContent, sendEmail} from "../Utils/mail.js"
import { body } from "express-validator";
import jwt from "jsonwebtoken"


const generateAccessandRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
    } catch (error) {
        throw new APIError(500,"something went wrong while generating Tokens",[])
    }
}

const registerUser=asyncHandler(async(req,res)=>{

    const {email,username,password,role}=req.body

    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new APIError(409,"User with email or username already Exists",[])
    }

    const user = new User({
        email,
        password,
        username,
        isEmailVerified: false
    })
    await user.save()  // validateBeforeSave nahi lagana

    const {unhashedToken,hashedToken,ExpiryTime}=user.generateTemproryToken()

    user.EmailVerificationToken=hashedToken
    user.EmailVerificationExpiry=ExpiryTime

    await user.save({validateBeforeSave:false})

    await sendEmail({
        email:user?.email,
        subject:"please Verify your email",
        MailgenContent:EmailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get('host')}/api/v1/users/verify-email/${unhashedToken}`,
        ),
    })
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken -EmailVerificationToken -EmailVerificationExpiry"
    )

    if(!createdUser){
        throw new APIError(408,"something went wrong while registering a user",[])
    }

    return res.status(201).json(
        new APIResponse(
            200,
            {user:createdUser},
            "User Registerd Successfully and verification has been sent"
        )
    )


})

const login=asyncHandler(async (req,res)=>{
    const {email,username,password}=req.body

    if(!email){
        throw new APIError(404,"email is required",[])
    }
    const user=await User.findOne({email})
    if(!user){
        throw new APIError(404,"user not exists!",[])
    }

    const ispasswordvalid=await user.isPasswordCorrect(password);
    if(!ispasswordvalid){
        throw new APIError(404,"Invalid password",[])
    }
    const {accessToken,refreshToken}=await generateAccessandRefreshToken(user._id)

    const loggedINUser=await User.findById(user._id).select(
        "-password -refreshToken -EmailVerificationToken -EmailVerificationExpiry"
    )

    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",refreshToken,options)
            .json(
                new APIResponse(
                    200,
                    {
                        user:loggedINUser,
                        accessToken,
                        refreshToken
                    },
                    "user Logged in Successfully"
                )
            ) 

})

const logout=asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:""
            }
        },
        {
            new:true   
        }
    );
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(
            new APIResponse(200,{},"User logged out")
        )
})

const currentUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(
        new APIResponse(
            200,
            req.user,
            "currentUser fetched Successfully"
        )
    )
})

const verifyEmail=asyncHandler(async(req,res)=>{
    const verificationToken=req.params

    if(!verificationToken){
        throw new APIError(401,"verificationToken is missing",[])
    }

    let hashedToken=crypto.createHash("sha256").update(verificationToken).digest("hex")

    const user=await User.findOne({
        EmailVerificationToken:hashedToken,
        EmailVerificationExpiry:{$gt:Date.now()}
    })

    if(!user){
        throw new APIError(401,"Token is expired or invalid",[])
    }

    user.EmailVerificationExpiry=undefined;
    user.EmailVerificationToken=undefined;

    user.isEmailVerified=true;
    await user.save({validateBeforeSave:false})

    return res.status(200).json(
        new APIResponse(200,{isEmailVerified:true},"Email is verified")
    )

})

const ResendEmailverification=asyncHandler(async(req,res)=>{
    const user=User.findById(req.user?._id)
    
    if(!user){
        throw new APIError(404,"user not exist",[])
    }

    if(user.isEmailVerified){
        throw new APIError(409,"User is already verified")
    }

    const {unhashedToken,hashedToken,ExpiryTime}=user.generateTemproryToken()

    user.EmailVerificationToken=hashedToken
    user.EmailVerificationExpiry=ExpiryTime

    await user.save({validateBeforeSave:false})

    await sendEmail({
        email:user?.email,
        subject:"please Verify your email",
        MailgenContent:EmailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get('host')}/api/v1/users/verify-email/${unhashedToken}`,
        ),
    })

    return res.status(200).json(
        new APIResponse(200,{},"verification mail  has been resent to your email")
    )


})

const refreshAccesToken=asyncHandler(async(req,res)=>{
    const incomingToken=req.cookies.refreshToken || req.body.refreshToken

    if(!incomingToken){
        new APIError(402,"Unautorized access")
    }

    try {
        const decodedToken=jwt.verify(incomingToken,process.env.REFRESH_TOKEN_SECRET)
        const user=User.findById(decodedToken?._id)
        if(!user){
           throw new APIError(402,"Invalid Refresh Token")
        }

        if(incomingToken !== user.refreshToken){
            throw new APIError(402,"Invalid Refresh Token")
        }

        const options={
            httpOnly:true,
            secure:true
        }

        const {accessToken,refreshToken:newrefreshToken}=await generateAccessandRefreshToken(user?.id)

        user.refreshToken=newrefreshToken
        return res.status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",newrefreshToken,options)
            .json(
            new APIResponse(200,
                {
                    "accessToken":accessToken,
                    "refreshToken":newrefreshToken
                },
                "Access Token Refreshed"
            )
        )

    } catch (error) {
         throw new APIError(402,"Invalid Refresh Token")
    }
})

export {
    registerUser,
    login,
    logout,
    currentUser,
    verifyEmail,
    ResendEmailverification,
    refreshAccesToken
}
