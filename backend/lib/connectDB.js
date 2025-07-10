import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); 

console.log("Hello from the connectDB file!");
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
