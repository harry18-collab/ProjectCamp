import {APIResponse} from "../utils/Api-response.js"
import asyncHandler from "../Utils/async-handler.js";

/*const healthcheck=(req,res)=>{
   try {
        res.status(200).json(
            new APIResponse(200,{message:"server is running"})
        );
   } catch (error) {
    
   }
}*/

const healthcheck=asyncHandler(async (req,res)=>{
    res.status(200).json(
        new APIResponse(200,{message:"server is still running"})
    )
})

export {healthcheck}