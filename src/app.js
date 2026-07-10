import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
const app=express()

//basic configurations
app.use(express.json({"limit":"16kb"}));
app.use(express.urlencoded({"extended":true,"limit":"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//core configurations
app.use(cors({
    origin:process.env.CORS_ORIGIN?.split(",")||"https://localhost:8000",
    allowedHeaders:["Content-Type","Authorization"],
    credentials:true,
    methods:["POST","GET","PATCH","PUT","OPTIONS","DELETE"]
}))

// importing routes
import healthcheckrouter from "./Routes/Healthcheck.routes.js";
import authRouter from "./Routes/auth.router.js";


app.use("/api/v1/healthcheck",healthcheckrouter);
app.use("/api/v1/auth",authRouter);



app.get('/',(req,res)=>{
    res.send("start project");
})

export default app