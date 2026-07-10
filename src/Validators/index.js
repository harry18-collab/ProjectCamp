import { body } from "express-validator";

const userRegisterValidator=()=>{
    return [
        body("email").trim()
        .isEmpty().withMessage("Email is required")
        .isEmail().withMessage("Email must be valid"),
        body("username").trim()
        .isEmpty().withMessage("username is required")
        .isLength({min:5}).withMessage("username must be of 5 characters atleast"),
        body('password').trim().isEmpty().withMessage("password is required"),
        body("fullname").optional().trim().isEmpty().withMessage("plz enter your full name")
    ]
}

export {
    userRegisterValidator
}