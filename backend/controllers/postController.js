import mongoose from "mongoose";
import postModel from "../models/postModel.js";
import User from "../models/userModel.js";
import ImageKit from "imagekit";
import dotenv from "dotenv";
dotenv.config();
export const fetchPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;

    const query = {};
    const cat = req.query.cat;
    console.log("req.query.cat",cat);
    const author = req.query.author;
    const searchQuery = req.query.search;
    const sortQuery = req.query.sort;
    const featured = req.query.featured;

    if (cat) {
      query.category = cat;
    }

    if (searchQuery) {
      query.title = { $regex: searchQuery, $options: "i" };
    }

    if (author) {
      const user = await User.findOne({ username: author }).select("_id");
      if (!user) {
        return res.json("No post found!");
      }
      query.user = user._id;
    }

    let sortObj = { createdAt: -1 };
    if (sortQuery) {
      switch (sortQuery) {
        case "newest":
          sortObj = { createdAt: -1 };
          break;
        case "oldest":
          sortObj = { createdAt: 1 };
          break;
        case "popular":
          sortObj = { visit: -1 };
          break;
        case "trending":
          sortObj = { visit: -1 };
          query.createdAt = {
            $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000) // ✅ fixed .getTime()
          };
          break;
      }
    }
    if(featured){
      query.isFeatured=true;
    }

    const posts = await postModel.find(query)
      .populate("user", "username")
      .sort(sortObj)
      .limit(limit)
      .skip((page - 1) * limit);

    const totalPosts = await postModel.countDocuments(query); // ✅ fixed: added query
    const hasMore = page * limit < totalPosts;

    res.setHeader("ngrok-skip-browser-warning", "true");
    res.json({ success: true, posts, hasMore });

  } catch (error) {
    console.log(error);
  }
}

export const addPost = async (req, res) => {
  try {
    const {userId} = await req.auth();
    console.log(userId);
    let clerkUserId=userId;
     // ✅ fix here

    if (!clerkUserId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // console.log("Clerk ID:", clerkUserId);

    const loggedinUser = await User.findOne({ clerkId: clerkUserId });
    console.log("Logged in user",loggedinUser)

    if (!loggedinUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    const { title,  desc, content,img ,category} = req.body;
    console.log("Request body:", req.body);
      let slug=req.body.title.replace(/ /g,"-").toLowerCase();
      const existingPost = await postModel.findOne({ slug });
      let counter=2
      while(existingPost){
        slug=`${slug}-${counter}`;
        counter++;
        existingPost = await postModel.findOne({ slug });
      }

    

    const newPost = {
      user: loggedinUser._id, // ✅ required field
      title,
      slug,
      desc,
      category,
      img,
      content,
    };

    const publish = await postModel.create(newPost);

    res.json({ success: true, publish });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getPost=async (req,res)=>{
    try {

     
     const post = await postModel.findOne({slug:req.params.slug}).populate("user","username img clerkId")
     res.json({ success: true, post });     
    } catch (error) {
        console.log(error);
        res.json({error});
        
    }
   

}

export const deletePost=async (req,res)=>{
  const clerkUserId=req.auth().userId;
  if(!clerkUserId){
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
     const role=req.auth()?.sessionClaims.metadata?.role || "user"
     if(role==="admin"){
      await postModel.findByIdAndDelete(req.params.id)
      return res.status(200).json("Post has been deleted ")
     }
    try {
      const user = await User.findOne({ clerkId:clerkUserId });
     const deletedPost = await postModel.findByIdAndDelete({_id:req.params.id,user: user._id});
     if(!deletedPost){
        return res.status(404).json({ success: false, error: "You can only delete your posts!" });
     }
     res.json({ success: true, post });     
    } catch (error) {
        console.log(error);
        res.json({error});
        
    }
    
}
const imagekit = new ImageKit({
  urlEndpoint: process.env.IK_URL_ENDPOINT,
  publicKey: process.env.IK_PUBLIC_KEY,
  privateKey: process.env.IK_PRIVATE_KEY,

})
export const uploadAuth = async (req, res) => { 
  var result=imagekit.getAuthenticationParameters();
  res.send(result);
}

export const featurePost = async (req, res) => {
  try {
    const clerkUserId = req.auth().userId;
    const { postId } = req.body;

    // 🔒 Check if user is authenticated
    if (!clerkUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 🔐 Check if user is admin
    const role = req.auth()?.sessionClaims?.metadata?.role || "user";
    if (role !== "admin") {
      return res.status(403).json({ success: false, message: "You are not allowed to feature posts" });
    }

    // 🔍 Fetch post
    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // 🔁 Toggle the isFeatured flag
    const updatedPost = await postModel.findByIdAndUpdate(
      postId,
      { isFeatured: !post.isFeatured },
      { new: true }
    );

    // ✅ Send back updated post and message
    return res.status(200).json({
      success: true,
      message: updatedPost.isFeatured ? "Post Featured" : "Post Unfeatured",
      post: updatedPost
    });
  } catch (error) {
    console.error("❌ Error featuring post:", error);
    return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
  }
};
