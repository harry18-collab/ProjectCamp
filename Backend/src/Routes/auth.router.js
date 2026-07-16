import { Router} from "express";
import
    { 
         registerUser,
        login,
        logout,
        currentUser,
        verifyEmail,
        ResendEmailverification,
        refreshAccesToken,
        forgetPassword,
        ResetPassword,
        ChangeCurrentPassword
    }
     from "../controllers/auth.controller.js";
import { userRegisterValidator,
    LoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator
} 
from "../Validators/index.js";
import { validate } from "../middleWares/validator.middleware.js";
import {VerifyJWT} from "../middleWares/auth.middleware.js"



const router=Router()

//unsecured Router 
router.route("/register").post(userRegisterValidator(),validate, registerUser)
router.route("/login").post(LoginValidator(), validate,login)
router.route("/verify-email/:verificationToken").get(verifyEmail)
router.route("refresh-token").post(refreshAccesToken)
router.route("/forgot-password").post(userForgotPasswordValidator(),validate,forgetPassword)
router.route("/reset-password/:resetToken").post( userResetForgotPasswordValidator(),ResetPassword)

// secure router 
router.route("/logout").post(VerifyJWT,logout)
router.route("/current-user").post(VerifyJWT,currentUser)
router.route("/change-password").post(VerifyJWT,userChangeCurrentPasswordValidator(),validate,ChangeCurrentPassword)
router.route("/resend-email-verification").post(VerifyJWT,verifyEmail)
export default router