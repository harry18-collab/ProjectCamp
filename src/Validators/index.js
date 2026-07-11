import { body } from "express-validator";

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

export {
    userRegisterValidator,
    LoginValidator
}