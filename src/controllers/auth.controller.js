import {User} from "../models/user.models.js"
import {APIResponse} from "../utils/Api-response.js"
import asyncHandler from "../Utils/async-handler.js";
import {APIError} from "../Utils/API-error.js"
import {EmailVerificationMailgenContent, sendEmail} from "../Utils/mail.js"
import { body } from "express-validator";


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


    const user=await User.create({
        email,
        password,
        username,
        isEmailVerified:false
    })

    const {unhashedToken,hashedToken,ExpiryTime}=user.generateTemproryToken()

    user.EmailVerificationToken=hashedToken
    user.EmailVerificationExpiry=ExpiryTime

    await user.save({validateBeforeSave:false})

    await sendEmail({
        email:user?.email,
        subject:"please Verify your email",
        mailgenContent:EmailVerificationMailgenContent(
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
    const user=await User.findOne(email)
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
                    400,
                    {
                        user:loggedINUser,
                        accessToken,
                        refreshToken
                    },
                    "user Logged in Successfully"
                )
            ) 

})

export {registerUser,login}