import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import Comment from "../models/commentModel.js";
import mongoose from "mongoose";
import { Webhook } from"svix";
import bodyParser from "body-parser";

export const clerkWebhook = async (req, res) => {
const WEBHOOK_SECRET=process.env.CLERK_WEBHOOK_SECRET;
     if(!WEBHOOK_SECRET){
        throw new Error("Webhook secret is not set");
     }

const payload = req.body;
    const headers = req.headers;

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;
    try {
        evt = wh.verify(payload, headers);
    } catch (err) {
        res.status(400).json({
            message:"Webhook Error",

        });
        
    }
    console.log("Event received:", evt.data);

  

    if (evt.type === 'user.created') {
          const email = evt.data.email_addresses[0].email_address;
const username = email.split('@')[0];

        const newUser=new User({
        clerkId: evt.data.id,
        username: evt.data.username || username,
        email: email,
        img: evt.data.profile_image_url || '',

        })
        await newUser.save();

    }

if (evt.type === "user.deleted") {
    const deletedUser = await User.findOneAndDelete({
      clerkId: evt.data.id,
    });

    // await Post.deleteMany({user:deletedUser._id})
    // await Comment.deleteMany({user:deletedUser._id})
  }

    return res.status(200).json({
        message: "Webhook received successfully",
        event: evt.type,
    });
   
}

