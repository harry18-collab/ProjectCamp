import mongoose, { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const userSchema=new Schema(
    {
        avatar:{
            type:{
                url:String,
                localpath:String
            },
            default:{
                url:`https://placehold.co/200x200`,
                localpath:""
            },
        },
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        fullname:{
            type:String,
            trim:true,
        },
        password:{
            type:String,
            required:[true,"password is required"],
        },
        isEmailVerified:{
            type:Boolean,
            default:false
        },
        refreshToken:{
            type:String,
        },
        forgotPasswordToken:{
            type:String,
        },
        forgotPasswordExpiry:{
            type:Date
        },
        EmailVerificationToken:{
            type:String,
        },
        EmailVerificationExpiry:{
            type:Date,
        },
    },
    {
        timestamps:true
    },
)

userSchema.pre("save", async function() {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.isPasswordCorrect=async function (password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
           _id:this._id,
           username:this.username,
           email:this.email, 
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
    )
}



userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
    )
}


userSchema.methods.generateTemproryToken=function(){
    const unhashedToken=crypto.randomBytes(20).toString("hex")

    const hashedToken=crypto.createHash("sha256").update(unhashedToken).digest('hex')

    const ExpiryTime=Date.now() + (20*60*1000) //20 mins;

    return {unhashedToken,hashedToken,ExpiryTime}

}


export const User=mongoose.model('User',userSchema)