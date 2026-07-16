import { Router} from "express";
import
    { 
        CreateProject,
        UpdateProject,
        DeleteProject,
        getProject, 
        getProjectById,
        addMembersToProject,
        GetProjectMembers,
        updateMemberRole,
        DeleteMember
    }
     from "../controllers/project.controller.js";
import {
    CreateProjectValidator,
    addMemberToProjectValidator
    } 
from "../Validators/index.js";
import { validate } from "../middleWares/validator.middleware.js";
import {VerifyJWT,ValidateProjectPermission} from "../middleWares/auth.middleware.js"
import { AvailableUserRoles, UserRolesENUM } from "../Utils/constants.js";



const router=Router()
router.use(VerifyJWT)

router.route('/').get(getProject).post(CreateProjectValidator(),validate,CreateProject)
router.route('/:projectId').get(ValidateProjectPermission(AvailableUserRoles),getProjectById)
        .put(ValidateProjectPermission([UserRolesENUM.ADMIN]),
                CreateProjectValidator(),
                validate,
                UpdateProject
    )
    .delete(
        ValidateProjectPermission([UserRolesENUM.ADMIN]),
        DeleteProject   
    )


router.route('/:projectId/members').get(GetProjectMembers)
    .post(
        ValidateProjectPermission([UserRolesENUM.ADMIN]),
        addMemberToProjectValidator(),
        validate,
        addMembersToProject
    )    

router.route('/:projectId/members/:userId')
    .put(ValidateProjectPermission([UserRolesENUM.ADMIN]),updateMemberRole)
    .delete(ValidateProjectPermission([UserRolesENUM.ADMIN]),DeleteMember)

export default router