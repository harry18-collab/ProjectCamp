import { Router} from "express";
import { registerUser,login} from "../controllers/auth.controller.js";
import { userRegisterValidator } from "../Validators/index.js";
import { validate } from "../middleWares/validator.middleware.js";



const router=Router()
router.route("/register").post(userRegisterValidator(),validate, registerUser)
router.route("/login").post(login)
export default router