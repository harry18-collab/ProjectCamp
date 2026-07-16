import { body } from "express-validator";
import { AvailableUserRoles,UserRolesENUM } from "../Utils/constants.js";
const userRegisterValidator=()=>{
    return [
        body("email").trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Email must be valid"),
        body("username").trim()
        .notEmpty().withMessage("username is required")
        .isLength({min:5}).withMessage("username must be of 5 characters atleast"),
        body('password').trim().notEmpty().withMessage("password is required"),
        body("fullname").optional().trim().notEmpty().withMessage("plz enter your full name")
    ]
}

const LoginValidator=()=>{
    return [
        body("email").notEmpty().withMessage("Message is requires")
        .isEmail().withMessage("Email is required"),
        body("password").notEmpty().withMessage("password is required")
    ]
}

const userChangeCurrentPasswordValidator=()=>{
    return [
        body('oldPassword').notEmpty().withMessage("old password is required"),
        body('newPassword').notEmpty().withMessage("new password is Required")
    ]
}

const userForgotPasswordValidator=()=>{
    return [
        body('email').notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Email must be of correct format")
    ]
}
const userResetForgotPasswordValidator=()=>{
    return [
        body('newPassword').notEmpty().withMessage("password is required")
    ]
}

const CreateProjectValidator=()=>{
    return [
        body("name").notEmpty().withMessage("name is required"),
        body('description').optional()
    ]
}

const addMemberToProjectValidator=()=>{
    return [
        body('email').notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email is Invalid'),
        body('role').trim().notEmpty().withMessage('Email is Required')
        .isIn(AvailableUserRoles).withMessage('Role is Invalid')
    ]
}

export {
    userRegisterValidator,
    LoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator,
    CreateProjectValidator,
    addMemberToProjectValidator
}