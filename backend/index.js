import express from "express"
import userRoute from "./routes/userRoute.js";
import postRoute from "./routes/postRoute.js";
import commentRoute from "./routes/commentRoute.js";
import webhookRoute from "./routes/webhookRoute.js";
import connectDB from "./lib/connectDB.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";

const app = express();
app.use(clerkMiddleware());
app.use(cors({
  origin: "https://blog-frontend-six-fawn.vercel.app",
  credentials: true, 
}));
app.use(express.json());

// DB Connection
connectDB();

// Routes
app.use("/", (req, res) => {
  res.json("working");
});

app.use("/webhooks", webhookRoute);
app.use("/users", userRoute);
app.use("/posts", (req, res, next) => {
  console.log("➡️ /posts route hit");
  next();
}, postRoute);
app.use("/comments", commentRoute);

// CORS headers (redundant since you're already using `cors()`, but if needed manually):
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Error handler (keep at bottom)
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    message: error.message || "Something went wrong",
    status: error.status,
    stack: error.stack,
  });
});

export default app;
