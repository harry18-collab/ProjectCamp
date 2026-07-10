import { validationResult } from "express-validator";
import { APIError } from "../Utils/API-error.js";

export const validate=(req,res,next)=>{
    const error=validationResult(req)
    if(error.isEmpty()){
        return next();
    }
    const extractedErrors=[]
    error.array().map((err)=>extractedErrors.push({
        [err.path]:err.msg
    }))
    throw new APIError(422,"data is not validated",extractedErrors)
}