import express from "express"
import userRoute from "./routes/userRoute.js";
import postRoute from "./routes/postRoute.js";
import commentRoute from "./routes/commentRoute.js";
import webhookRoute from "./routes/webhookRoute.js";
import connectDB from "./lib/connectDB.js";
import {clerkMiddleware, requireAuth} from "@clerk/express"
import cors from "cors";



console.log("Hello from the backend!");
// Accessing the environment variable

const app=express();
app.use(clerkMiddleware())
app.use(cors())

    connectDB()



app.use((error,req,res,next)=>{
    res.status(error.status || 500)
    res.json({
        message:error.message || "Something went wrong",
        status:error.status,
        stack:error.stack,
        
    })
    
})

app.use(function (req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})

// app.get("/auth-state",(req,res)=>{
//     const authState=req.auth
//     res.json(authState)
// })
// app.get("/protect",(req,res)=>{
//     const {userId}=req.auth
    
//     if(!userId){
//         return res.status(401).json({message:"Unauthorized"})
//     }
//     res.status(200).json("content")
// })

// app.get("/protect",requireAuth())

app.use("/webhooks",webhookRoute)

app.use(express.json());
app.use("/users", userRoute);
app.use("/posts", (req, res, next) => {
  console.log("➡️ /posts route hit");
  next();
}, postRoute);


app.use("/comments", commentRoute);


