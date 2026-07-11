import { Router} from "express";
import { registerUser,login,logout} from "../controllers/auth.controller.js";
import { userRegisterValidator,LoginValidator } from "../Validators/index.js";
import { validate } from "../middleWares/validator.middleware.js";
import {VerifyJWT} from "../middleWares/auth.middleware.js"



const router=Router()
router.route("/register").post(userRegisterValidator(),validate, registerUser)
router.route("/login").post(LoginValidator(), validate,login)
router.route("/logout").post(VerifyJWT,logout)
export default router