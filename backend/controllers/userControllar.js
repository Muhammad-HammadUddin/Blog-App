import User from "../models/userModel.js"

export const getUserSavedPosts=async (req,res)=>{
     const clerkId=req.auth().userId;
     if(!clerkId){
        return res.status(401).json("Not Authenticated")
     }
     const user =await User.findOne({clerkId})

     res.status(200).json(user?.savedPosts)
}
export const savePost=async (req,res)=>{

     const clerkId=req.auth().userId;
     const postId=req.body.postId
     if(!clerkId){
        return res.status(401).json("Not Authenticated")
     }
     const user =await User.findOne({clerkId})
     const isSaved=user.savedPosts?.some((p)=>p===postId)
      if(!isSaved ){
        await User.findByIdAndUpdate(user._id,{
            $push:{savedPosts:postId}
        })
      }
      else{
         await User.findByIdAndUpdate(user._id,{
            $pull:{savedPosts:postId}
        })

      }
     res.status(200).json(isSaved?"Post unsaved ":"Post Saved")

}